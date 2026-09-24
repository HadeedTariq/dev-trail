package repository

import (
	"context"
	"fmt"

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

func (r *workspaceRepository) ExecTx(ctx context.Context, fn func(q *sqlc.Queries) error) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}

	// ALWAYS defer a rollback.
	// If the transaction is committed successfully later, this deferred call
	// becomes a harmless no-op. If it panics or fails, this guarantees cleanup.
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// Bind sqlc queries to this active transaction
	qtx := r.queries.WithTx(tx)

	// Execute business function
	if err := fn(qtx); err != nil {
		// Deferred tx.Rollback() will catch this and release the pool connection
		return err
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit tx: %w", err)
	}

	return nil
}
