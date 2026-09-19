package repository

import (
	"context"

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
