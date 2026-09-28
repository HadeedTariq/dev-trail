package handler

import (
	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/middleware"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/gin-gonic/gin"
)

func SetupWorkspaceRoutes(router *gin.RouterGroup, handler *WorkspaceHandler, workspaceRepo repository.WorkspaceRepository) {
	workspace := router.Group("/workspace")
	{
		workspace.GET("/", handler.GetWorkspaces)
		workspace.POST("/create", handler.CreateWorkspace)
		workspace.PUT("/update/:id", handler.UpdateWorkspace)
		workspace.GET("/:id", handler.GetWorkspaceByID)
		workspace.DELETE("/delete/:id", handler.DeleteWorkspace)
		// ~ so over there the specific middleware can be used like for this action only admin and like the owner can make request
		workspace.POST("/:workspaceId/members/invite", middleware.RequireWorkspaceRole(workspaceRepo, repo.WorkspaceRoleADMIN, repo.WorkspaceRoleOWNER), handler.InviteMember)
	}
}
