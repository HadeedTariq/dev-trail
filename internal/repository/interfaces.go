package repository

import (
	"context"
	"time"

	sqlc "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

type UserRepository interface {
	GetByEmail(ctx context.Context, email pgtype.Text) (*sqlc.User, error)
	GetActiveOtp(ctx context.Context, email pgtype.Text) (*sqlc.EmailOtp, error)
	ExecTx(ctx context.Context, fn func(q *sqlc.Queries) error) error
	CreateUserWithOTP(ctx context.Context, user *sqlc.User, otp string, expiresAt time.Time) error
	VerifyUserAndUpdateRefreshToken(
		ctx context.Context,
		email pgtype.Text,
		refreshToken pgtype.Text,
	) (pgtype.UUID, error)
	GetById(ctx context.Context, id pgtype.UUID) (*sqlc.User, error)
}

type WorkspaceRepository interface {
	Create(
		ctx context.Context,
		name string,
		createdBy pgtype.UUID,
		image pgtype.Text,
	) (*sqlc.CreateWorkspaceRow, error)
}
