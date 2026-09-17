package handler

import "github.com/gin-gonic/gin"

func SetupWorkspaceRoutes(router *gin.RouterGroup, handler *WorkspaceHandler) {
	workspace := router.Group("/workspace")
	{
		workspace.POST("/create")
	}
}
