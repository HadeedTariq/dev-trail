package middleware

import (
	"strings"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/service"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	"github.com/gin-gonic/gin"
)

func CheckAuth(tokenService service.TokenService) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("accessToken")
		if err != nil {
			utils.RespondUnauthorized(c, "Authentication required")
			c.Abort()
			return
		}

		claims, err := tokenService.VerifyAccessToken(tokenString)
		if err != nil {
			utils.RespondUnauthorized(c, "Invalid or expired access token")
			c.Abort()
			return
		}

		c.Set("user", claims)
		c.Set("user_id", claims.ID)
		c.Set("user_name", claims.UserName)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("user_gender", claims.Gender)

		c.Next()
	}
}

func Auth(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user *repo.User
		var err error

		// Check for Bearer token
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			token := strings.TrimPrefix(authHeader, "Bearer ")
			user, err = authService.ValidateToken(nil, token)
		} else if strings.HasPrefix(authHeader, "ApiKey ") {
			// Check for API Key
			apiKey := strings.TrimPrefix(authHeader, "ApiKey ")
			user, err = authService.ValidateAPIKey(nil, apiKey)
		} else {
			utils.RespondUnauthorized(c, "Missing or invalid authorization header")
			c.Abort()
			return
		}

		if err != nil {
			utils.RespondUnauthorized(c, "Invalid credentials")
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", user)
		c.Set("user_id", user.ID)
		c.Set("user_role", string(user.Role))

		c.Next()
	}
}
func RequireRole(roles ...repo.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			utils.RespondForbidden(c, "Access denied")
			c.Abort()
			return
		}

		currentRole, ok := userRole.(repo.Role)
		if !ok {
			utils.RespondForbidden(c, "Invalid user role")
			c.Abort()
			return
		}

		for _, role := range roles {
			if currentRole == role {
				c.Next()
				return
			}
		}

		utils.RespondForbidden(c, "Insufficient permissions")
		c.Abort()
	}
}
