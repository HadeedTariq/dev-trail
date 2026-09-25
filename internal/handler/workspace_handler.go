package handler

import (
	"errors"
	"fmt"
	"net/http"

	apperrors "github.com/HadeedTariq/dev-trail/internal/errors"

	"github.com/HadeedTariq/dev-trail/internal/service"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type inviteMemberRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role"  binding:"required,oneof=ADMIN MEMBER VIEWER"`
}

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

func (h *WorkspaceHandler) GetWorkspaces(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "WorkspaceHandler.GetWorkspaces")

	userId, _ := c.Get("user_id")

	workspaces, err := h.workspaceService.GetUserWorkspaces(
		c.Request.Context(),
		userId.(string),
	)
	if err != nil {
		logger.WithError(err).Error("failed to fetch user workspaces")
		utils.RespondInternalError(c)
		return
	}

	utils.LogHandlerResponse(logger, http.StatusOK, workspaces)
	utils.RespondSuccess(c, http.StatusOK, workspaces)
}

func (h *WorkspaceHandler) UpdateWorkspace(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "WorkspaceHandler.UpdateWorkspace")

	userId, _ := c.Get("user_id")

	workspaceID := c.Param("id")
	name := c.PostForm("name")

	if workspaceID == "" {
		utils.RespondBadRequest(c, "Workspace ID is required")
		return
	}

	if name == "" {
		utils.RespondBadRequest(c, "Workspace name is required")
		return
	}

	imageURL := ""

	file, err := c.FormFile("image")
	if err == nil {
		imageURL, err = h.imageService.Upload(c.Request.Context(), file)
		if err != nil {
			logger.WithError(err).Error("workspace image upload failed")
			utils.RespondInternalError(c)
			return
		}
	}

	_, err = h.workspaceService.UpdateWorkspace(
		c.Request.Context(),
		workspaceID,
		name,
		imageURL,
		userId.(string),
	)
	if err != nil {
		logger.WithError(err).Error("workspace update failed")
		utils.RespondInternalError(
			c,
		)
		return
	}

	response := utils.Response{
		Message: fmt.Sprintf("Workspace: %s updated successfully", name),
	}

	utils.LogHandlerResponse(
		logger,
		http.StatusOK,
		response,
	)

	utils.RespondSuccess(
		c,
		http.StatusOK,
		response,
	)
}

func (h *WorkspaceHandler) GetWorkspaceByID(c *gin.Context) {
	logger := utils.LogHandlerStart(
		c,
		"WorkspaceHandler.GetWorkspaceByID",
	)

	userId, _ := c.Get("user_id")

	workspaceID := c.Param("id")

	if workspaceID == "" {
		logger.Warn("workspace ID not provided")
		utils.RespondBadRequest(c, "Workspace ID is required")
		return
	}

	workspace, err := h.workspaceService.GetWorkspaceByID(
		c.Request.Context(),
		workspaceID,
		userId.(string),
	)
	if err != nil {
		logger.WithError(err).Error("failed to fetch workspace")

		if errors.Is(err, pgx.ErrNoRows) {
			utils.RespondNotFound(c, "Workspace not found")
			return
		}

		utils.RespondInternalError(
			c,
		)
		return
	}

	response := gin.H{
		"id":         workspace.ID,
		"name":       workspace.Name,
		"created_by": workspace.CreatedBy,
		"image":      workspace.Image,
		"created_at": workspace.CreatedAt,
		"updated_at": workspace.UpdatedAt,
	}

	utils.LogHandlerResponse(
		logger,
		http.StatusOK,
		response,
	)

	utils.RespondSuccess(
		c,
		http.StatusOK,
		response,
	)
}

func (h *WorkspaceHandler) DeleteWorkspace(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "WorkspaceHandler.DeleteWorkspace")

	workspaceID := c.Param("id")
	if workspaceID == "" {
		logger.Warn("workspace ID not provided")
		utils.RespondBadRequest(c, "Workspace ID is required")
		return
	}

	userId, _ := c.Get("user_id")

	userID, ok := userId.(string)
	if !ok || userID == "" {
		logger.Error("invalid user ID in context")
		utils.RespondUnauthorized(c, "Invalid authentication data")
		return
	}

	workspace, err := h.workspaceService.DeleteWorkspace(
		c.Request.Context(),
		workspaceID,
		userID,
	)
	if err != nil {
		logger.WithError(err).Error("failed to delete workspace")
		if errors.Is(err, pgx.ErrNoRows) {
			utils.RespondNotFound(c, "Workspace not found")
			return
		}
		utils.RespondInternalError(c)
		return
	}

	response := gin.H{
		"id": workspace.ID,
	}

	utils.LogHandlerResponse(logger, http.StatusOK, response)
	utils.RespondSuccess(c, http.StatusOK, response)
}

func (h *WorkspaceHandler) InviteMember(c *gin.Context) {
	logger := utils.LogHandlerStart(c, "WorkspaceHandler.InviteMember")

	// 1. Caller identity (from CheckAuth middleware)
	userId, _ := c.Get("user_id")

	// 2. Workspace ID from the URL: /workspaces/:workspaceId/members/invite
	workspaceID := c.Param("workspaceId")
	if workspaceID == "" {
		utils.RespondBadRequest(c, "Workspace ID is required")
		return
	}

	// 3. Bind JSON body
	var req inviteMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.WithError(err).Warn("invalid invite request body")
		utils.RespondBadRequest(c, err.Error())
		return
	}

	// 4. Call service
	result, err := h.workspaceService.InviteMember(
		c.Request.Context(),
		workspaceID,
		userId.(string),
		req.Email,
		req.Role,
	)
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrAlreadyMember):
			logger.WithError(err).Warn("user already a member")
			utils.RespondConflict(c, "This user is already a member of the workspace")
			return

		case errors.Is(err, apperrors.ErrInvitationAlreadyPending):
			logger.WithError(err).Warn("invitation already pending")
			utils.RespondConflict(c, "An invitation is already pending for this email")
			return

		default:
			logger.WithError(err).Error("invite member failed")
			utils.RespondInternalError(c)
			return
		}
	}

	// 5. Shape the response based on which path was taken
	message := "Invitation sent successfully"
	if result.AddedDirectly {
		message = "Member added successfully"
	}

	response := utils.Response{
		Message: message,
		Data: gin.H{
			"added_directly": result.AddedDirectly,
			"invitation_id":  result.InvitationID,
		},
	}

	utils.LogHandlerResponse(logger, http.StatusCreated, response)
	utils.RespondSuccess(c, http.StatusCreated, response)
}
