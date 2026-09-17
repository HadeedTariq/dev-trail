package handler

import (
	"errors"
	"net/http"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/config"
	apperrors "github.com/HadeedTariq/dev-trail/internal/errors"
	"github.com/HadeedTariq/dev-trail/internal/service"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userService  service.UserService
	tokenService service.TokenService
	jwtConfig    config.JWTConfig
}

func NewAuthHandler(userService service.UserService, tokenService service.TokenService, jwtConfig config.JWTConfig) *AuthHandler {
	return &AuthHandler{
		userService:  userService,
		tokenService: tokenService,
		jwtConfig:    jwtConfig,
	}
}

type RegisterRequest struct {
	Email    string `json:"email"     binding:"required,email,max=100"`
	Password string `json:"password"  binding:"required,min=8,max=100,strong_password"`
	UserName string `json:"user_name" binding:"required,min=3,max=30,alphanum_underscore"`
	Gender   string `json:"gender"    binding:"required,oneof=male female other"`
}

// AuthRequest mirrors Zod's authSchema (Login)
type AuthRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// CreatePasswordRequest mirrors Zod's createPasswordSchema
type CreatePasswordRequest struct {
	Password string `json:"password" binding:"required,min=8,max=100,strong_password"`
}

// EmailOTPRequest mirrors Zod's emailOtpSchema
type EmailOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp"   binding:"required,len=6,numeric"`
}

// ForgetPasswordRequest mirrors Zod's forgetPasswordSchema
type ForgetPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest mirrors Zod's resetPasswordSchema (including password confirmation match)
type ResetPasswordRequest struct {
	Token           string `json:"token"           binding:"required,min=32,max=256"`
	NewPassword     string `json:"newPassword"     binding:"required,min=8,max=128,strong_password"`
	ConfirmPassword string `json:"confirmPassword" binding:"required,eqfield=NewPassword"`
}
type AuthResponse struct {
	Token        string     `json:"token"`
	RefreshToken string     `json:"refresh_token,omitempty"`
	User         *repo.User `json:"user"`
}

func (h *AuthHandler) AuthenticateUser(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "AuthHandler.AuthenticateUser")

	claimsValue, exists := c.Get("user")
	if !exists {
		logger.Warn("authentication claims not found")
		utils.RespondUnauthorized(c, "User not authenticated")
		return
	}

	claims, ok := claimsValue.(*service.AccessTokenClaims)
	if !ok {
		logger.Error("invalid authentication claims in context")
		utils.RespondUnauthorized(c, "Invalid authentication data")
		return
	}

	response := gin.H{
		"id":        claims.UserID,
		"user_name": claims.UserName,
		"email":     claims.Email,
		"role":      claims.Role,
		"gender":    claims.Gender,
	}

	utils.LogHandlerResponse(logger, http.StatusOK, response)
	utils.RespondSuccess(c, http.StatusOK, response)
}

func (h *AuthHandler) Register(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "AuthHandler.Register")
	ctx := c.Request.Context()

	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(err).SetType(gin.ErrorTypeBind)
		return
	}

	// 1. Pass clean primitive parameters or DTO to the Service layer
	_, err := h.userService.Register(ctx, req.Email, req.UserName, req.Gender, req.Password)
	if err != nil {
		logger.WithError(err).Warn("Registration failed")
		if errors.Is(err, apperrors.ErrDuplicateEmail) {
			utils.RespondConflict(c, "user with this email already exists")
		} else if errors.Is(err, apperrors.ErrOtpAlreadySend) {
			utils.RespondTooManyRequests(c, err.Error())
		} else {
			utils.RespondBadRequest(c, err.Error())
		}
		return
	}

	response := utils.Response{
		Message: "User registered successfully. OTP has been sent to your email.",
	}

	utils.LogHandlerResponse(logger, http.StatusCreated, response)
	utils.RespondSuccess(c, http.StatusCreated, response)
}
func (h *AuthHandler) OtpEmailChecker(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "AuthHandler.OtpEmailChecker")
	ctx := c.Request.Context()

	var req EmailOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(err).SetType(gin.ErrorTypeBind)
		return
	}

	user, err := h.userService.OtpValidator(ctx, req.Email, req.OTP)
	if err != nil {
		logger.WithError(err).Warn("OTP validation failed")

		switch {
		case errors.Is(err, apperrors.ErrOtpExpired):
			utils.RespondNotFound(c, "OTP has expired or is invalid")
		case errors.Is(err, apperrors.ErrInvalidOtp):
			utils.RespondBadRequest(c, "Incorrect OTP entered")
		case errors.Is(err, apperrors.ErrUserNotFound):
			utils.RespondNotFound(c, "User not found")
		default:
			utils.RespondInternalError(c)
		}

		return
	}

	tokens, err := h.tokenService.IssueTokens(ctx, user)
	if err != nil {
		logger.WithError(err).Error("Failed to issue tokens")
		utils.RespondInternalError(c)
		return
	}

	h.setAuthCookies(c, tokens)

	response := utils.Response{
		Message: "OTP verified and user logged in successfully.",
	}

	utils.LogHandlerResponse(logger, http.StatusOK, response)
	utils.RespondSuccess(c, http.StatusOK, response)
}

func (h *AuthHandler) AuthenticateWithCredentials(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "AuthHandler.AuthenticateWithCredentials")
	ctx := c.Request.Context()

	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(err).SetType(gin.ErrorTypeBind)
		return
	}

	user, err := h.userService.Authenticate(ctx, req.Email, req.Password)
	if err != nil {
		logger.WithError(err).Warn("Authentication failed")

		switch {
		case errors.Is(err, apperrors.ErrUserNotFound):
			utils.RespondNotFound(c, "No user found with the provided credentials")
		case errors.Is(err, apperrors.ErrUserUnverified):
			utils.RespondForbidden(c, "User account is not verified. Please complete verification first")
		case errors.Is(err, apperrors.ErrInvalidPassword):
			utils.RespondUnauthorized(c, "Invalid email or password")
		default:
			utils.RespondInternalError(c)
		}
		return
	}

	tokens, err := h.tokenService.IssueTokens(ctx, user)
	if err != nil {
		logger.WithError(err).Error("Failed to issue tokens")
		utils.RespondInternalError(c)
		return
	}

	h.setAuthCookies(c, tokens)

	response := utils.Response{
		Message: "Authenticated successfully",
	}

	utils.LogHandlerResponse(logger, http.StatusOK, response)
	utils.RespondSuccess(c, http.StatusOK, response)
}

func (h *AuthHandler) AuthenticateWithRefreshToken(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "AuthHandler.AuthenticateWithRefreshToken")
	ctx := c.Request.Context()

	refreshToken, err := c.Cookie("refreshToken")
	if err != nil || refreshToken == "" {
		logger.Warn("Refresh token cookie missing")
		utils.RespondUnauthorized(c, "Refresh token is missing")
		return
	}

	tokenData, err := h.tokenService.VerifyRefreshToken(refreshToken)

	if err != nil {
		logger.WithError(err).Warn("Invalid refresh token")
		utils.RespondUnauthorized(c, "Invalid or expired refresh token")
		return
	}

	user, err := h.userService.ValidateUserRefreshToken(ctx, tokenData.UserID, refreshToken)
	if err != nil {
		logger.WithError(err).Warn("Authentication failed")

		switch {
		case errors.Is(err, apperrors.ErrUserNotFound):
			utils.RespondNotFound(c, "No user found with the provided credentials")
		case errors.Is(err, apperrors.ErrUserUnverified):
			utils.RespondForbidden(c, "User account is not verified. Please complete verification first")
		case errors.Is(err, apperrors.ErrInvalidPassword):
			utils.RespondUnauthorized(c, "Invalid email or password")
		default:
			utils.RespondInternalError(c)
		}
		return
	}

	tokens, err := h.tokenService.IssueTokens(ctx, user)
	if err != nil {
		logger.WithError(err).Error("Failed to issue tokens")
		utils.RespondInternalError(c)
		return
	}

	h.setAuthCookies(c, tokens)

	response := utils.Response{
		Message: "Authenticated successfully",
	}

	utils.LogHandlerResponse(logger, http.StatusOK, response)
	utils.RespondSuccess(c, http.StatusOK, response)
}

func (h *AuthHandler) setAuthCookies(
	c *gin.Context,
	tokens *service.TokenPair,
) error {
	cookieMaxAge := int(h.jwtConfig.REFRESH_TOKEN_EXPIRY_HOURS * 60 * 60)

	c.SetCookie(
		"accessToken",
		tokens.AccessToken,
		cookieMaxAge,
		"/",
		h.jwtConfig.CookieDomain,
		h.jwtConfig.CookieSecure,
		true,
	)

	c.SetCookie(
		"refreshToken",
		tokens.RefreshToken,
		cookieMaxAge,
		"/",
		h.jwtConfig.CookieDomain,
		h.jwtConfig.CookieSecure,
		true,
	)

	return nil
}
