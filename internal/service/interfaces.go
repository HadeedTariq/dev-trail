package service

import (
	"context"
	"mime/multipart"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

type AuthTokens struct {
	AccessToken  string
	RefreshToken string
	// User is the authenticated account the tokens belong to, so handlers can
	// mirror the login response shape without a second lookup. RefreshToken is
	// the raw opaque value — it is returned to the client once and only its
	// hash is persisted; it must never be logged.
	User *repo.User
}

type AuthService interface {
	Login(ctx context.Context, email, password string) (string, error)
	LoginWithTokens(ctx context.Context, email, password string) (*AuthTokens, error)
	ValidateToken(ctx context.Context, token string) (*repo.User, error)
	ValidateAPIKey(ctx context.Context, key string) (*repo.User, error)
	GenerateJWT(ctx context.Context, user *repo.User) (string, error)
	GenerateTokens(ctx context.Context, user *repo.User) (*AuthTokens, error)
	RefreshAccessToken(ctx context.Context, refreshToken string) (*AuthTokens, error)
	InvalidateRefreshToken(ctx context.Context, refreshToken string) error
	// Logout revokes the given refresh token if it belongs to the user, or all
	// of the user's refresh tokens when refreshToken is empty. Idempotent.
	Logout(ctx context.Context, userID uint, refreshToken string) error
	ChangePassword(ctx context.Context, userID uint, currentPassword, newPassword string) error
	// RequestPasswordReset never discloses whether the account exists; mail
	// and lookup failures are swallowed by design (anti-enumeration).
	RequestPasswordReset(ctx context.Context, email string) error
	ConfirmPasswordReset(ctx context.Context, token, newPassword string) error
	GenerateCSRFToken() (string, error)
	ValidateCSRFToken(token string) bool
}

type UserService interface {
	Register(
		ctx context.Context,
		email, userName, gender, password string,
	) (*repo.User, error)
	OtpValidator(
		ctx context.Context,
		email, otp string,
	) (*repo.User, error)
	Authenticate(
		ctx context.Context,
		email, password string,
	) (*repo.User, error)
	ValidateUserRefreshToken(
		ctx context.Context,
		userIDStr string,
		providedToken string,
	) (*repo.User, error)
}

type TokenService interface {
	IssueTokens(
		ctx context.Context, user *repo.User,
	) (*TokenPair, error)
	VerifyAccessToken(
		tokenString string,
	) (*AccessTokenClaims, error)
	VerifyRefreshToken(
		tokenString string,
	) (*RefreshTokenClaims, error)
}

type WorkspaceService interface {
	CreateWorkspace(
		ctx context.Context,
		name string,
		createdBy string,
		image string,
	) (workspace *repo.CreateWorkspaceRow, err error)
	GetUserWorkspaces(
		ctx context.Context,
		userID string,
	) (workspaces []repo.FindWorkspacesByUserIDRow, err error)
	UpdateWorkspace(
		ctx context.Context,
		workspaceID string,
		name string,
		image string,
		updatedBy string,
	) (workspaceIDResult pgtype.UUID, err error)
	GetWorkspaceByID(
		ctx context.Context,
		id string,
		userID string,
	) (workspace *repo.FindUserWorkspacesByIdRow, err error)
}

type ImageService interface {
	Upload(context.Context, *multipart.FileHeader) (string, error)
}
