package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	apperrors "github.com/HadeedTariq/dev-trail/internal/errors"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/metrics"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/HadeedTariq/dev-trail/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
)

type workspaceService struct {
	workspaceRepo repository.WorkspaceRepository
	userRepo      repository.UserRepository
}

func NewWorkspaceService(workspaceRepo repository.WorkspaceRepository,
	userRepo repository.UserRepository,
) WorkspaceService {
	return &workspaceService{
		workspaceRepo: workspaceRepo,
		userRepo:      userRepo,
	}
}

func (ws *workspaceService) CreateWorkspace(
	ctx context.Context,
	name string,
	createdBy string,
	image string,
) (workspace *repo.CreateWorkspaceRow, err error) {
	start := time.Now()

	tr := otel.Tracer("workspaceService")
	ctx, span := tr.Start(ctx, "workspaceService.CreateWorkspace")
	defer span.End()

	span.SetAttributes(
		attribute.String("workspace.name", name),
		attribute.String("workspace.created_by", createdBy),
	)

	defer func() {
		duration := time.Since(start).Seconds()
		metrics.WorkspaceOperationDuration.
			WithLabelValues("create").
			Observe(duration)

		if err != nil {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("create", "error").
				Inc()
			span.RecordError(err)
		} else {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("create", "success").
				Inc()
		}
	}()

	// 1. Parse the creator's user ID
	createdByUUID, parseErr := uuid.Parse(createdBy)
	if parseErr != nil {
		err = fmt.Errorf("invalid created by user ID: %w", parseErr)
		return nil, err
	}

	createdByPg := pgtype.UUID{
		Bytes: createdByUUID,
		Valid: true,
	}

	imagePg := pgtype.Text{
		String: image,
		Valid:  image != "",
	}

	// 2. Run both inserts inside a single transaction
	var created *repo.CreateWorkspaceRow

	txErr := utils.ExecTx(ctx, func(q *repo.Queries) error {
		// 2a. Insert the workspace
		wsRow, repoErr := ws.workspaceRepo.Create(
			ctx,
			q,
			name,
			createdByPg,
			imagePg,
		)
		if repoErr != nil {
			return fmt.Errorf("failed to create workspace: %w", repoErr)
		}

		// 2b. Insert the creator as the OWNER member
		_, repoErr = ws.workspaceRepo.AddMember(
			ctx,
			q,
			wsRow.ID,
			createdByPg,
			repo.WorkspaceRoleOWNER,
			pgtype.UUID{}, // no inviter for the initial owner
		)
		if repoErr != nil {
			return fmt.Errorf("failed to add owner as workspace member: %w", repoErr)
		}

		created = wsRow
		return nil
	})

	if txErr != nil {
		err = txErr
		return nil, err
	}

	return created, nil
}

func (ws *workspaceService) GetUserWorkspaces(
	ctx context.Context,
	userID string,
) (workspaces []repo.FindWorkspacesByUserIDRow, err error) {
	start := time.Now()

	tr := otel.Tracer("workspaceService")
	ctx, span := tr.Start(ctx, "workspaceService.GetUserWorkspaces")
	defer span.End()

	span.SetAttributes(
		attribute.String("workspace.user_id", userID),
	)

	defer func() {
		duration := time.Since(start).Seconds()
		metrics.WorkspaceOperationDuration.
			WithLabelValues("get").
			Observe(duration)

		if err != nil {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("get", "error").
				Inc()
			span.RecordError(err)
		} else {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("get", "success").
				Inc()
		}
	}()

	parsedUserID, parseErr := uuid.Parse(userID)
	if parseErr != nil {
		err = fmt.Errorf("invalid user ID: %w", parseErr)
		return nil, err
	}

	userUUID := pgtype.UUID{
		Bytes: parsedUserID,
		Valid: true,
	}

	workspaces, repoErr := ws.workspaceRepo.FindByUserID(
		ctx,
		userUUID,
	)
	if repoErr != nil {
		err = fmt.Errorf("failed to fetch user workspaces: %w", repoErr)
		return nil, err
	}

	return workspaces, nil
}

func (ws *workspaceService) UpdateWorkspace(
	ctx context.Context,
	workspaceID string,
	name string,
	image string,
	updatedBy string,
) (workspaceIDResult pgtype.UUID, err error) {
	start := time.Now()

	tr := otel.Tracer("workspaceService")
	ctx, span := tr.Start(ctx, "workspaceService.UpdateWorkspace")
	defer span.End()

	span.SetAttributes(
		attribute.String("workspace.id", workspaceID),
		attribute.String("workspace.updated_by", updatedBy),
	)

	defer func() {
		metrics.WorkspaceOperationDuration.
			WithLabelValues("update").
			Observe(time.Since(start).Seconds())

		if err != nil {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("update", "error").
				Inc()
			span.RecordError(err)
		} else {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("update", "success").
				Inc()
		}
	}()

	parsedWorkspaceID, parseErr := uuid.Parse(workspaceID)
	if parseErr != nil {
		err = fmt.Errorf("invalid workspace ID: %w", parseErr)
		return pgtype.UUID{}, err
	}

	parsedUserID, parseErr := uuid.Parse(updatedBy)
	if parseErr != nil {
		err = fmt.Errorf("invalid user ID: %w", parseErr)
		return pgtype.UUID{}, err
	}

	imagePg := pgtype.Text{
		String: image,
		Valid:  image != "",
	}

	workspacePg := pgtype.UUID{
		Bytes: parsedWorkspaceID,
		Valid: true,
	}

	userPg := pgtype.UUID{
		Bytes: parsedUserID,
		Valid: true,
	}

	updatedID, repoErr := ws.workspaceRepo.Update(
		ctx,
		workspacePg,
		name,
		imagePg,
		userPg,
	)
	if repoErr != nil {
		err = fmt.Errorf("failed to update workspace: %w", repoErr)
		return pgtype.UUID{}, err
	}

	return updatedID, nil
}

func (ws *workspaceService) GetWorkspaceByID(
	ctx context.Context,
	id string,
	userID string,
) (workspace *repo.FindUserWorkspacesByIdRow, err error) {
	start := time.Now()

	tr := otel.Tracer("workspaceService")
	ctx, span := tr.Start(ctx, "workspaceService.GetWorkspaceByID")
	defer span.End()

	span.SetAttributes(
		attribute.String("workspace.id", id),
		attribute.String("workspace.user_id", userID),
	)

	defer func() {
		metrics.WorkspaceOperationDuration.
			WithLabelValues("get").
			Observe(time.Since(start).Seconds())

		if err != nil {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("get", "error").
				Inc()
			span.RecordError(err)
		} else {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("get", "success").
				Inc()
		}
	}()

	workspaceUUID, parseErr := uuid.Parse(id)
	if parseErr != nil {
		err = fmt.Errorf("invalid workspace ID: %w", parseErr)
		return nil, err
	}

	userUUID, parseErr := uuid.Parse(userID)
	if parseErr != nil {
		err = fmt.Errorf("invalid user ID: %w", parseErr)
		return nil, err
	}

	workspaceID := pgtype.UUID{
		Bytes: workspaceUUID,
		Valid: true,
	}

	createdBy := pgtype.UUID{
		Bytes: userUUID,
		Valid: true,
	}

	result, repoErr := ws.workspaceRepo.FindByID(
		ctx,
		workspaceID,
		createdBy,
	)
	if repoErr != nil {
		err = fmt.Errorf("failed to fetch workspace: %w", repoErr)
		return nil, err
	}

	return &result, nil
}

func (ws *workspaceService) DeleteWorkspace(
	ctx context.Context,
	id string,
	userID string,
) (workspace repo.DeleteWorkspaceRow, err error) {
	start := time.Now()

	tr := otel.Tracer("workspaceService")
	ctx, span := tr.Start(ctx, "workspaceService.DeleteWorkspace")
	defer span.End()

	span.SetAttributes(
		attribute.String("workspace.id", id),
		attribute.String("workspace.user_id", userID),
	)

	defer func() {
		metrics.WorkspaceOperationDuration.
			WithLabelValues("delete").
			Observe(time.Since(start).Seconds())

		if err != nil {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("delete", "error").
				Inc()
			span.RecordError(err)
		} else {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("delete", "success").
				Inc()
		}
	}()

	workspaceUUID, parseErr := uuid.Parse(id)
	if parseErr != nil {
		err = fmt.Errorf("invalid workspace ID: %w", parseErr)
		return repo.DeleteWorkspaceRow{}, err
	}

	userUUID, parseErr := uuid.Parse(userID)
	if parseErr != nil {
		err = fmt.Errorf("invalid user ID: %w", parseErr)
		return repo.DeleteWorkspaceRow{}, err
	}

	workspaceID := pgtype.UUID{
		Bytes: workspaceUUID,
		Valid: true,
	}

	createdBy := pgtype.UUID{
		Bytes: userUUID,
		Valid: true,
	}

	workspace, repoErr := ws.workspaceRepo.Delete(
		ctx,
		workspaceID,
		createdBy,
	)
	if repoErr != nil {
		err = fmt.Errorf("failed to delete workspace: %w", repoErr)
		return repo.DeleteWorkspaceRow{}, err
	}

	return workspace, nil
}

type InviteMemberResult struct {
	AddedDirectly bool   // true if the user was already on the platform
	InvitationID  string // populated only if an email invitation was created
}

// ~ workspace member invitation functionality
func (ws *workspaceService) InviteMember(
	ctx context.Context,
	workspaceID string,
	invitedBy string,
	email string,
	role string,
) (result *InviteMemberResult, err error) {
	start := time.Now()

	tr := otel.Tracer("workspaceService")
	ctx, span := tr.Start(ctx, "workspaceService.InviteMember")
	defer span.End()

	span.SetAttributes(
		attribute.String("workspace.id", workspaceID),
		attribute.String("workspace.invited_by", invitedBy),
		attribute.String("workspace.invite_email", email),
		attribute.String("workspace.invite_role", role),
	)

	defer func() {
		duration := time.Since(start).Seconds()
		metrics.WorkspaceOperationDuration.
			WithLabelValues("invite").
			Observe(duration)

		if err != nil {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("invite", "error").
				Inc()
			span.RecordError(err)
		} else {
			metrics.WorkspaceOperationsTotal.
				WithLabelValues("invite", "success").
				Inc()
		}
	}()

	// 1. Parse UUIDs
	workspaceUUID, parseErr := uuid.Parse(workspaceID)
	if parseErr != nil {
		err = fmt.Errorf("invalid workspace ID: %w", parseErr)
		return nil, err
	}
	invitedByUUID, parseErr := uuid.Parse(invitedBy)
	if parseErr != nil {
		err = fmt.Errorf("invalid invited_by user ID: %w", parseErr)
		return nil, err
	}

	workspacePg := pgtype.UUID{Bytes: workspaceUUID, Valid: true}
	invitedByPg := pgtype.UUID{Bytes: invitedByUUID, Valid: true}

	// 2. Normalize email
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))

	// 3. Validate role
	workspaceRole := repo.WorkspaceRole(role)
	switch workspaceRole {
	case repo.WorkspaceRoleADMIN,
		repo.WorkspaceRoleMEMBER,
		repo.WorkspaceRoleVIEWER:
		// OK — OWNER cannot be assigned via invite
	default:
		err = fmt.Errorf("invalid role: %s", role)
		return nil, err
	}

	var inviteResult *InviteMemberResult

	txErr := utils.ExecTx(ctx, func(q *repo.Queries) error {
		// 4. Is this email already a member of the workspace?
		_, memberErr := ws.workspaceRepo.FindMemberByWorkspaceAndEmail(
			ctx, q, workspacePg, normalizedEmail,
		)
		if memberErr == nil {
			// Found a member row → reject
			return apperrors.ErrAlreadyMember

		}
		// pgx.ErrNoRows is the expected case — anything else is a real error
		if !errors.Is(memberErr, pgx.ErrNoRows) {
			return fmt.Errorf("check existing member: %w", memberErr)
		}

		emailPg := pgtype.Text{String: normalizedEmail, Valid: email != ""}

		// 5. Is this email a platform user?
		user, userErr := ws.userRepo.GetByEmail(ctx, q, emailPg)
		if userErr == nil {
			// 5a. Platform user → add directly
			_, addErr := ws.workspaceRepo.AddMember(
				ctx, q,
				workspacePg,
				user.ID,
				workspaceRole,
				invitedByPg,
			)
			if addErr != nil {
				return fmt.Errorf("add existing user as member: %w", addErr)
			}

			inviteResult = &InviteMemberResult{AddedDirectly: true}
			return nil
		}
		if !errors.Is(userErr, pgx.ErrNoRows) {
			return fmt.Errorf("lookup user by email: %w", userErr)
		}

		// 5b. Not a platform user → check for duplicate pending invite
		_, pendingErr := ws.workspaceRepo.FindPendingByWorkspaceAndEmail(
			ctx, q, workspacePg, normalizedEmail,
		)
		if pendingErr == nil {
			return apperrors.ErrInvitationAlreadyPending
		}
		if !errors.Is(pendingErr, pgx.ErrNoRows) {
			return fmt.Errorf("check pending invitation: %w", pendingErr)
		}

		// 5c. Generate a secure token
		token, tokenErr := utils.GenerateInviteToken()
		if tokenErr != nil {
			return fmt.Errorf("generate invite token: %w", tokenErr)
		}

		expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 days

		inv, createErr := ws.workspaceRepo.CreateWorkspaceInvitation(
			ctx, q,
			workspacePg,
			normalizedEmail,
			invitedByPg,
			workspaceRole,
			token,
			expiresAt,
		)
		if createErr != nil {
			return fmt.Errorf("create invitation: %w", createErr)
		}

		inviteResult = &InviteMemberResult{
			InvitationID: inv.ID.String(),
		}

		// 6. Send the invite email AFTER commit
		//    (deferred below — see note)
		return nil
	})

	if txErr != nil {
		err = txErr
		return nil, err
	}

	// 7. Send email outside the tx — never let email failure roll back the DB write
	if inviteResult != nil && !inviteResult.AddedDirectly {
		// ----- TODO: wire up your mail service -----
		// inviteToken := ... need to return token from closure for this
		// go ws.mailService.SendWorkspaceInvitation(
		//     ctx,
		//     normalizedEmail,
		//     workspaceName,
		//     invitedByName,
		//     inviteToken,
		// )
		//
		// Recommended: use a background goroutine or a queue so the HTTP
		// response isn't blocked by SMTP latency. Log failures — don't
		// return them to the caller, since the invite is already persisted.
	}

	return inviteResult, nil
}
