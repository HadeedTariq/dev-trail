package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	apperrors "github.com/HadeedTariq/dev-trail/internal/errors"
	"github.com/HadeedTariq/dev-trail/internal/mailer"
	"github.com/HadeedTariq/dev-trail/internal/metrics"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"golang.org/x/crypto/bcrypt"
)

// isNotFound reports whether a repository error means "there is no such row".
// Repositories hand gorm's own sentinel straight back to us, so the helper
// must cover it alongside the apperrors sentinels; apperrors.IsNotFound does.
func isNotFound(err error) bool {
	return apperrors.IsNotFound(err)
}

type userService struct {
	userRepo repository.UserRepository
	mailer   mailer.Mailer
}

func NewUserService(userRepo repository.UserRepository, mailer mailer.Mailer) UserService {
	return &userService{userRepo: userRepo,
		mailer: mailer}
}

func (s *userService) Register(
	ctx context.Context,
	email, userName, gender, password string,
) (*repo.User, error) {
	start := time.Now()
	tr := otel.Tracer("userService")
	ctx, span := tr.Start(ctx, "userService.Register")
	defer span.End()

	span.SetAttributes(attribute.String("user.Email", email))

	// Track function result and metrics EXACTLY ONCE on return
	var err error
	defer func() {
		duration := time.Since(start).Seconds()
		metrics.UserOperationDuration.WithLabelValues("register").Observe(duration)

		if err != nil {
			metrics.UserOperationsTotal.WithLabelValues("register", "error").Inc()
			span.RecordError(err)
		} else {
			metrics.UserOperationsTotal.WithLabelValues("register", "success").Inc()
		}
	}()

	// Construct DB model inside Service or Repository
	emailPg := pgtype.Text{String: email, Valid: email != ""}
	user := &repo.User{
		Email:    emailPg,
		UserName: pgtype.Text{String: userName, Valid: userName != ""},
		Gender:   repo.NullUserGender{UserGender: repo.UserGender(gender), Valid: gender != ""},
	}

	// Check if user already exists
	existing, _ := s.userRepo.GetByEmail(ctx, emailPg)
	if existing != nil {
		err = fmt.Errorf("user with this email already exists: %w", apperrors.ErrDuplicateEmail)
		return nil, err
	}

	// Check for active OTP
	existingOtp, _ := s.userRepo.GetActiveOtp(ctx, emailPg)
	if existingOtp != nil {
		err = fmt.Errorf("%w. Please wait before requesting another one.", apperrors.ErrOtpAlreadySend)
		return nil, err
	}

	// Generate OTP
	otp, err := utils.GenerateOTP(6)
	if err != nil {
		return nil, err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user.Password = pgtype.Text{String: string(hashedPassword), Valid: true}

	// Save to DB (User + OTP in one transaction)
	expiresAt := time.Now().Add(5 * time.Minute)
	err = s.userRepo.CreateUserWithOTP(ctx, user, otp, expiresAt)
	if err != nil {
		return nil, err
	}

	// Dispatch email asynchronously in background so SMTP latency
	// does not block HTTP response or rollback DB creation
	go func(recipient, code string) {
		// Use detached background context for async task
		_, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if mailErr := s.mailer.SendOtp(recipient, code); mailErr != nil {
			utils.Logger.WithError(mailErr).
				WithField("email", recipient).
				Error("Failed to send background OTP email")
		}
	}(email, otp)

	return user, nil
}

func (s *userService) OtpValidator(
	ctx context.Context,
	email, otp string,
) (*repo.User, error) {
	start := time.Now()
	tr := otel.Tracer("userService")
	ctx, span := tr.Start(ctx, "userService.OtpValidator")
	defer span.End()

	span.SetAttributes(attribute.String("user.Email", email))

	var err error
	defer func() {
		duration := time.Since(start).Seconds()
		metrics.UserOperationDuration.WithLabelValues("otp_email_checker").Observe(duration)

		if err != nil {
			metrics.UserOperationsTotal.WithLabelValues("otp_email_checker", "error").Inc()
			span.RecordError(err)
		} else {
			metrics.UserOperationsTotal.WithLabelValues("otp_email_checker", "success").Inc()
		}
	}()

	emailPg := pgtype.Text{
		String: email,
		Valid:  true,
	}

	existingOtp, err := s.userRepo.GetActiveOtp(ctx, emailPg)
	if err != nil {
		err = fmt.Errorf("failed to get active otp: %w", err)
		return nil, err
	}

	if existingOtp == nil {
		err = fmt.Errorf("%w: email=%s", apperrors.ErrOtpExpired, email)
		return nil, err
	}

	if existingOtp.Otp != otp {
		err = fmt.Errorf("%w: email=%s", apperrors.ErrInvalidOtp, email)
		return nil, err
	}

	user, err := s.userRepo.GetByEmail(ctx, emailPg)
	if err != nil {
		err = fmt.Errorf("failed to find user by email: %w", err)
		return nil, err
	}

	if user == nil {
		err = fmt.Errorf("%w: email=%s", apperrors.ErrUserNotFound, email)
		return nil, err
	}

	return user, nil
}

func (s *userService) Authenticate(
	ctx context.Context,
	email, password string,
) (*repo.User, error) {
	start := time.Now()
	tr := otel.Tracer("userService")
	ctx, span := tr.Start(ctx, "userService.Authenticate")
	defer span.End()

	span.SetAttributes(attribute.String("user.Email", email))

	// Track function execution result and metrics EXACTLY ONCE on return
	var err error
	defer func() {
		duration := time.Since(start).Seconds()
		metrics.UserOperationDuration.WithLabelValues("authenticate").Observe(duration)

		if err != nil {
			metrics.UserOperationsTotal.WithLabelValues("authenticate", "error").Inc()
			span.RecordError(err)
		} else {
			metrics.UserOperationsTotal.WithLabelValues("authenticate", "success").Inc()
		}
	}()

	// 1. Convert primitive to DB type
	emailPg := pgtype.Text{String: email, Valid: email != ""}

	// 2. Fetch user from database
	user, fetchErr := s.userRepo.GetByEmail(ctx, emailPg)
	if fetchErr != nil {
		if errors.Is(fetchErr, pgx.ErrNoRows) || errors.Is(fetchErr, apperrors.ErrUserNotFound) {
			err = fmt.Errorf("invalid credentials: %w", apperrors.ErrUserNotFound)
			return nil, err
		}
		err = fmt.Errorf("failed to fetch user: %w", fetchErr)
		return nil, err
	}

	// 3. Verify if user is verified
	if !user.IsVerified {
		err = fmt.Errorf("account is unverified: %w", apperrors.ErrUserUnverified)
		return nil, err
	}

	// 4. Verify password
	if err = bcrypt.CompareHashAndPassword([]byte(user.Password.String), []byte(password)); err != nil {
		err = fmt.Errorf("invalid password: %w", apperrors.ErrInvalidPassword)
		return nil, err
	}

	return user, nil
}

func (s *userService) ValidateUserRefreshToken(
	ctx context.Context,
	userIDStr string,
	providedToken string,
) (*repo.User, error) {
	start := time.Now()
	tr := otel.Tracer("userService")
	ctx, span := tr.Start(ctx, "userService.ValidateUserRefreshToken")
	defer span.End()

	span.SetAttributes(attribute.String("user.id", userIDStr))

	var err error
	defer func() {
		duration := time.Since(start).Seconds()
		metrics.UserOperationDuration.WithLabelValues("validate_refresh_token").Observe(duration)

		if err != nil {
			metrics.UserOperationsTotal.WithLabelValues("validate_refresh_token", "error").Inc()
			span.RecordError(err)
		} else {
			metrics.UserOperationsTotal.WithLabelValues("validate_refresh_token", "success").Inc()
		}
	}()

	// 1. Convert string UUID to pgtype.UUID
	var userUUID pgtype.UUID
	_ = userUUID.Scan(userIDStr)

	// 2. Fetch user from DB by pgtype.UUID
	user, fetchErr := s.userRepo.GetById(ctx, userUUID)
	if fetchErr != nil {
		if errors.Is(fetchErr, pgx.ErrNoRows) || errors.Is(fetchErr, apperrors.ErrUserNotFound) {
			err = fmt.Errorf("user not found: %w", apperrors.ErrUserNotFound)
			return nil, err
		}
		err = fmt.Errorf("failed to fetch user by id: %w", fetchErr)
		return nil, err
	}

	// 3. Validate stored refresh token against the incoming token
	if user.RefreshToken.String != providedToken {
		err = fmt.Errorf("token mismatched or revoked: %w", apperrors.ErrTokenRevoked)
		return nil, err
	}

	return user, nil
}
