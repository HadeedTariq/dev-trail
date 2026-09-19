package handler

import (
	"net/http"

	"github.com/HadeedTariq/dev-trail/internal/service"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	"github.com/gin-gonic/gin"
)

type WorkspaceHandler struct {
	workspaceService service.WorkspaceService
	imageService     service.ImageService
}

func NewWorkspaceHandler(
	workspaceService service.WorkspaceService,
	imageService service.ImageService,
) *WorkspaceHandler {
	return &WorkspaceHandler{
		workspaceService: workspaceService,
		imageService:     imageService,
	}
}

func (h *WorkspaceHandler) CreateWorkspace(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "WorkspaceHandler.CreateWorkspace")

	userId, _ := c.Get("user_id")

	name := c.PostForm("name")

	if name == "" {
		utils.RespondBadRequest(c, "Workspace name is required")
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		logger.WithError(err).Warn("workspace image not provided")
		utils.RespondBadRequest(c, "Workspace image is required")
		return
	}

	imageURL, err := h.imageService.Upload(c.Request.Context(), file)
	if err != nil {
		logger.WithError(err).Error("workspace image upload failed")
		utils.RespondInternalError(c)
		return
	}

	_, err = h.workspaceService.CreateWorkspace(
		c.Request.Context(),
		name,
		userId.(string),
		imageURL,
	)
	if err != nil {
		logger.WithError(err).Error("workspace creation failed")
		utils.RespondInternalError(c)
		return
	}

	response := utils.Response{
		Message: "Workspace created successfully",
	}

	utils.LogHandlerResponse(logger, http.StatusCreated, response)
	utils.RespondSuccess(c, http.StatusCreated, response)
}
