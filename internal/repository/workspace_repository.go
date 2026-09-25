package repository

import (
	"context"
	"fmt"
	"time"

	sqlc "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type workspaceRepository struct {
	pool    *pgxpool.Pool
	queries *sqlc.Queries
}

func NewWorkspaceRepository(pool *pgxpool.Pool, queries *sqlc.Queries) WorkspaceRepository {
	return &workspaceRepository{
		pool:    pool,
		queries: queries,
	}
}

func (r *workspaceRepository) Create(
	ctx context.Context,
	q *sqlc.Queries,
	name string,
	createdBy pgtype.UUID,
	image pgtype.Text,
) (*sqlc.CreateWorkspaceRow, error) {
	workspace, err := r.queries.CreateWorkspace(ctx, sqlc.CreateWorkspaceParams{
		Name:      name,
		CreatedBy: createdBy,
		Image:     image,
	})
	if err != nil {
		return nil, err
	}

	return &workspace, nil
}

func (r *workspaceRepository) AddMember(
	ctx context.Context,
	q *sqlc.Queries,
	workspaceID pgtype.UUID,
	userID pgtype.UUID,
	role sqlc.WorkspaceRole,
	invitedBy pgtype.UUID,
) (*sqlc.WorkspaceMember, error) {
	if q == nil {
		q = r.queries
	}

	member, err := q.AddWorkspaceMember(ctx, sqlc.AddWorkspaceMemberParams{
		WorkspaceID: workspaceID,
		UserID:      userID,
		Role:        role,
		InvitedBy:   invitedBy,
	})
	if err != nil {
		return nil, fmt.Errorf("add workspace member: %w", err)
	}

	return &member, nil
}

func (r *workspaceRepository) FindByUserID(
	ctx context.Context,
	userID pgtype.UUID,
) ([]sqlc.FindWorkspacesByUserIDRow, error) {
	return r.queries.FindWorkspacesByUserID(ctx, userID)
}

func (r *workspaceRepository) FindByID(
	ctx context.Context,
	id pgtype.UUID,
	userID pgtype.UUID,
) (sqlc.FindUserWorkspacesByIdRow, error) {
	return r.queries.FindUserWorkspacesById(ctx, sqlc.FindUserWorkspacesByIdParams{
		ID:        id,
		CreatedBy: userID,
	})
}

func (r *workspaceRepository) Update(
	ctx context.Context,
	id pgtype.UUID,
	name string,
	image pgtype.Text,
	createdBy pgtype.UUID,
) (pgtype.UUID, error) {
	workspaceID, err := r.queries.UpdateWorkspace(ctx, sqlc.UpdateWorkspaceParams{
		ID:        id,
		Name:      name,
		Image:     image,
		CreatedBy: createdBy,
	})
	if err != nil {
		return pgtype.UUID{}, err
	}
	return workspaceID, nil
}
func (r *workspaceRepository) Delete(
	ctx context.Context,
	id pgtype.UUID,
	createdBy pgtype.UUID,
) (sqlc.DeleteWorkspaceRow, error) {
	workspace, err := r.queries.DeleteWorkspace(ctx, sqlc.DeleteWorkspaceParams{
		ID:        id,
		CreatedBy: createdBy,
	})
	if err != nil {
		return sqlc.DeleteWorkspaceRow{}, err
	}
	return workspace, nil
}

func (r *workspaceRepository) CreateWorkspaceInvitation(
	ctx context.Context,
	q *sqlc.Queries,
	workspaceID pgtype.UUID,
	email string,
	invitedBy pgtype.UUID,
	role sqlc.WorkspaceRole,
	token string,
	expiresAt time.Time,
) (*sqlc.WorkspaceInvitation, error) {
	if q == nil {
		q = r.queries
	}

	inv, err := q.CreateWorkspaceInvitation(ctx, sqlc.CreateWorkspaceInvitationParams{
		WorkspaceID: workspaceID,
		Email:       email,
		InvitedBy:   invitedBy,
		Role:        role,
		Token:       token,
		ExpiresAt: pgtype.Timestamptz{
			Time:  expiresAt,
			Valid: true,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("create workspace invitation: %w", err)
	}
	return &inv, nil
}

func (r *workspaceRepository) FindPendingByWorkspaceAndEmail(
	ctx context.Context,
	q *sqlc.Queries,
	workspaceID pgtype.UUID,
	email string,
) (*sqlc.WorkspaceInvitation, error) {
	if q == nil {
		q = r.queries
	}

	inv, err := q.FindPendingInvitationByWorkspaceAndEmail(
		ctx,
		sqlc.FindPendingInvitationByWorkspaceAndEmailParams{
			WorkspaceID: workspaceID,
			Lower:       email,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("find pending invitation: %w", err)
	}
	return &inv, nil
}

func (r *workspaceRepository) FindMemberByWorkspaceAndEmail(
	ctx context.Context,
	q *sqlc.Queries,
	workspaceID pgtype.UUID,
	email string,
) (*sqlc.WorkspaceMember, error) {
	if q == nil {
		q = r.queries
	}

	m, err := q.FindMemberByWorkspaceAndEmail(
		ctx,
		sqlc.FindMemberByWorkspaceAndEmailParams{
			WorkspaceID: workspaceID,
			Lower:       email,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("find member by email: %w", err)
	}
	return &m, nil
}

func (r *workspaceRepository) GetMemberRole(
	ctx context.Context,
	q *sqlc.Queries,
	workspaceID pgtype.UUID,
	userID pgtype.UUID,
) (sqlc.WorkspaceRole, error) {
	if q == nil {
		q = r.queries
	}

	role, err := q.GetWorkspaceMemberRole(ctx, sqlc.GetWorkspaceMemberRoleParams{
		WorkspaceID: workspaceID,
		UserID:      userID,
	})
	if err != nil {
		return "", fmt.Errorf("get workspace member role: %w", err)
	}
	return role, nil
}
