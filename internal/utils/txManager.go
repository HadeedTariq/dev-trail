// internal/utils/tx.go
package utils

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"
)

// txDeps holds the DB pool + base queries so ExecTx can open transactions
// without every caller needing to pass them around.
type txDeps struct {
	pool    *pgxpool.Pool
	queries *repo.Queries
}

var db *txDeps

// InitTx wires the pool + queries into the utils package.
// Call this once from main.go, after building the pool and sqlc.Queries.
func InitTx(pool *pgxpool.Pool, queries *repo.Queries) {
	db = &txDeps{pool: pool, queries: queries}
}

// ExecTx runs fn inside a transaction using the default isolation level.
// If fn returns an error or panics, the transaction is rolled back.
// If fn returns nil, the transaction is committed.
func ExecTx(
	ctx context.Context,
	fn func(q *repo.Queries) error,
) error {
	return ExecTxWithIsolation(ctx, pgx.ReadCommitted, fn)
}

// ExecTxWithIsolation is the general form — pass a specific isolation level
// when you need RepeatableRead, Serializable, etc.
func ExecTxWithIsolation(
	ctx context.Context,
	iso pgx.TxIsoLevel,
	fn func(q *repo.Queries) error,
) error {
	if db == nil {
		return fmt.Errorf("utils: InitTx was not called")
	}

	tx, err := db.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: iso})
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}

	// Guarantee cleanup on panic — rollback, then re-panic so the caller
	// (and any recovery middleware) still sees it.
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback(ctx)
			panic(p)
		}
	}()

	qtx := db.queries.WithTx(tx)

	if err := fn(qtx); err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("tx error: %w (rollback error: %v)", err, rbErr)
		}
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}

	return nil
}
