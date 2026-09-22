package handler

import "github.com/gin-gonic/gin"

func SetupWorkspaceRoutes(router *gin.RouterGroup, handler *WorkspaceHandler) {
	workspace := router.Group("/workspace")
	{
		workspace.GET("/", handler.GetWorkspaces)
		workspace.POST("/create", handler.CreateWorkspace)
		workspace.PUT("/update/:id", handler.UpdateWorkspace)
		workspace.GET("/:id", handler.GetWorkspaceByID)
	}
}
