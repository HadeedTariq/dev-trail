package service

import (
	"context"
	"fmt"
	"time"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/config"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type AccessTokenClaims struct {
	UserID   string `json:"id"`
	UserName string `json:"user_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Gender   string `json:"gender"`
	jwt.RegisteredClaims
}

type RefreshTokenClaims struct {
	UserID string `json:"id"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	RefreshToken string `json:"refreshToken"`
	AccessToken  string `json:"accessToken"`
}
type tokenService struct {
	accessTokenSecret  []byte
	refreshTokenSecret []byte
	accessTokenExpiry  time.Duration
	refreshTokenExpiry time.Duration
	userRepo           repository.UserRepository
}

func NewTokenService(cfg config.JWTConfig, userRepo repository.UserRepository) TokenService {
	return &tokenService{
		accessTokenSecret:  []byte(cfg.ACCESS_TOKEN_SECRET),
		refreshTokenSecret: []byte(cfg.REFRESH_TOKEN_SECRET),
		accessTokenExpiry:  time.Duration(cfg.ACCESS_TOKEN_EXPIRY_HOURS) * time.Hour,
		refreshTokenExpiry: time.Duration(cfg.REFRESH_TOKEN_EXPIRY_HOURS) * time.Hour,
		userRepo:           userRepo,
	}
}

func (s *tokenService) IssueTokens(
	ctx context.Context, user *repo.User,
) (*TokenPair, error) {
	now := time.Now()
	userID := uuid.UUID(user.ID.Bytes).String()

	refreshClaims := RefreshTokenClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.refreshTokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	accessClaims := AccessTokenClaims{
		UserID:   userID,
		UserName: user.UserName.String,
		Email:    user.Email.String,
		Role:     string(user.Role),
		Gender:   string(user.Gender.UserGender),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessTokenExpiry)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	refreshToken := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		refreshClaims,
	)

	accessToken := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		accessClaims,
	)

	signedRefreshToken, err := refreshToken.SignedString(s.refreshTokenSecret)
	if err != nil {
		return nil, err
	}

	signedAccessToken, err := accessToken.SignedString(s.accessTokenSecret)
	if err != nil {
		return nil, err
	}

	_, err = s.userRepo.VerifyUserAndUpdateRefreshToken(ctx, user.Email, pgtype.Text{
		String: signedRefreshToken,
		Valid:  true,
	})

	if err != nil {
		return nil, err
	}

	return &TokenPair{
		RefreshToken: signedRefreshToken,
		AccessToken:  signedAccessToken,
	}, nil
}

func (s *tokenService) VerifyAccessToken(
	tokenString string,
) (*AccessTokenClaims, error) {
	claims := &AccessTokenClaims{}

	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Method.Alg())
			}

			return s.accessTokenSecret, nil
		},
	)

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid access token")
	}

	return claims, nil
}

func (s *tokenService) VerifyRefreshToken(
	tokenString string,
) (*RefreshTokenClaims, error) {
	claims := &RefreshTokenClaims{}

	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Method.Alg())
			}

			return s.refreshTokenSecret, nil
		},
	)

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid refresh token")
	}

	return claims, nil
}
