package repository

import (
	"context"
	"time"

	sqlc "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

type UserRepository interface {
	GetByEmail(ctx context.Context, q *sqlc.Queries, email pgtype.Text) (*sqlc.User, error)
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
		q *sqlc.Queries,
		name string,
		createdBy pgtype.UUID,
		image pgtype.Text,
	) (*sqlc.CreateWorkspaceRow, error)
	FindByUserID(ctx context.Context, userID pgtype.UUID) ([]sqlc.FindWorkspacesByUserIDRow, error)
	Update(
		ctx context.Context,
		id pgtype.UUID,
		name string,
		image pgtype.Text,
		createdBy pgtype.UUID,
	) (pgtype.UUID, error)
	FindByID(
		ctx context.Context,
		id pgtype.UUID,
		userID pgtype.UUID,
	) (sqlc.FindUserWorkspacesByIdRow, error)
	Delete(
		ctx context.Context,
		id pgtype.UUID,
		createdBy pgtype.UUID,
	) (sqlc.DeleteWorkspaceRow, error)
	AddMember(
		ctx context.Context,
		q *sqlc.Queries,
		workspaceID pgtype.UUID,
		userID pgtype.UUID,
		role sqlc.WorkspaceRole,
		invitedBy pgtype.UUID,
	) (*sqlc.WorkspaceMember, error)
	FindPendingByWorkspaceAndEmail(
		ctx context.Context,
		q *sqlc.Queries,
		workspaceID pgtype.UUID,
		email string,
	) (*sqlc.WorkspaceInvitation, error)
	CreateWorkspaceInvitation(
		ctx context.Context,
		q *sqlc.Queries,
		workspaceID pgtype.UUID,
		email string,
		invitedBy pgtype.UUID,
		role sqlc.WorkspaceRole,
		token string,
		expiresAt time.Time,
	) (*sqlc.WorkspaceInvitation, error)
	FindMemberByWorkspaceAndEmail(
		ctx context.Context,
		q *sqlc.Queries,
		workspaceID pgtype.UUID,
		email string,
	) (*sqlc.WorkspaceMember, error)
}
