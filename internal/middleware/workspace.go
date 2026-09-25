package middleware

import (
	"errors"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// RequireWorkspaceRole checks if the authenticated user has one of the allowed workspace roles.
func RequireWorkspaceRole(workspaceRepo repository.WorkspaceRepository, allowedRoles ...repo.WorkspaceRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Extract workspace ID from URL parameters
		workspaceIDStr := c.Param("workspaceId")

		if workspaceIDStr == "" {
			utils.RespondBadRequest(c, "Workspace ID is required")
			c.Abort()
			return
		}

		var workspaceUUID pgtype.UUID
		if err := workspaceUUID.Scan(workspaceIDStr); err != nil || !workspaceUUID.Valid {
			utils.RespondBadRequest(c, "Invalid workspace ID format")
			c.Abort()
			return
		}

		// 2. Extract user_id set by CheckAuth middleware
		userIDVal, exists := c.Get("user_id")
		if !exists {
			utils.RespondUnauthorized(c, "User authentication required")
			c.Abort()
			return
		}

		var userUUID pgtype.UUID
		switch v := userIDVal.(type) {
		case string:
			if err := userUUID.Scan(v); err != nil || !userUUID.Valid {
				utils.RespondUnauthorized(c, "Invalid user authentication data")
				c.Abort()
				return
			}
		case pgtype.UUID:
			userUUID = v
		default:
			utils.RespondUnauthorized(c, "Invalid user authentication data")
			c.Abort()
			return
		}

		// 3. Query the user's role in this workspace
		role, err := workspaceRepo.GetMemberRole(c.Request.Context(), nil, workspaceUUID, userUUID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				utils.RespondForbidden(c, "You are not a member of this workspace")
				c.Abort()
				return
			}
			utils.RespondInternalError(c)
			c.Abort()
			return
		}

		// 4. Validate if user role matches allowed roles
		hasPermission := false
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			utils.RespondForbidden(c, "Insufficient workspace permissions")
			c.Abort()
			return
		}

		// Store user's workspace role in context in case downstream handlers need it
		c.Set("workspace_role", role)

		c.Next()
	}
}
