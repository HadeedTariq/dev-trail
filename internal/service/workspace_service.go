package service

import (
	"context"
	"fmt"
	"time"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/HadeedTariq/dev-trail/internal/metrics"
	"github.com/HadeedTariq/dev-trail/internal/repository"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
)

type workspaceService struct {
	workspaceRepo repository.WorkspaceRepository
}

func NewWorkspaceService(workspaceRepo repository.WorkspaceRepository) WorkspaceService {
	return &workspaceService{
		workspaceRepo: workspaceRepo,
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
		metrics.WorkspaceOperationDuration.WithLabelValues("create").Observe(duration)

		if err != nil {
			metrics.WorkspaceOperationsTotal.WithLabelValues("create", "error").Inc()
			span.RecordError(err)
		} else {
			metrics.WorkspaceOperationsTotal.WithLabelValues("create", "success").Inc()
		}
	}()

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

	workspace, repoErr := ws.workspaceRepo.Create(
		ctx,
		name,
		createdByPg,
		imagePg,
	)
	if repoErr != nil {
		err = fmt.Errorf("failed to create workspace: %w", repoErr)
		return nil, err
	}

	return workspace, nil
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
