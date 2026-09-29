package handler

import (
	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/middleware"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/gin-gonic/gin"
)

func SetupWorkspaceRoutes(protectedRouter *gin.RouterGroup, publicRouter *gin.RouterGroup, handler *WorkspaceHandler, workspaceRepo repository.WorkspaceRepository) {
	protectedWorkspace := protectedRouter.Group("/workspace")
	{
		protectedWorkspace.GET("/", handler.GetWorkspaces)
		protectedWorkspace.POST("/create", handler.CreateWorkspace)
		protectedWorkspace.PUT("/update/:id", handler.UpdateWorkspace)
		protectedWorkspace.GET("/:id", handler.GetWorkspaceByID)
		protectedWorkspace.DELETE("/delete/:id", handler.DeleteWorkspace)
		// ~ so over there the specific middleware can be used like for this action only admin and like the owner can make request
		protectedWorkspace.POST("/:workspaceId/members/invite", middleware.RequireWorkspaceRole(workspaceRepo, repo.WorkspaceRoleADMIN, repo.WorkspaceRoleOWNER), handler.InviteMember)

	}
	publicWorkspace := publicRouter.Group("/workspace")
	{
		publicWorkspace.GET("/invitations/verify/:token", handler.VerifyInvitation)
	}
}
