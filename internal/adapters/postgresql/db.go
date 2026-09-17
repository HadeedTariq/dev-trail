package postgresql

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/HadeedTariq/dev-trail/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

func InitDatabase(ctx context.Context, cfg *config.DatabaseConfig) (*pgxpool.Pool, error) {
	// 1. Configure Connection Pool
	poolConfig, err := pgxpool.ParseConfig(cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("unable to parse database dsn: %w", err)
	}

	poolConfig.MaxConns = 100
	poolConfig.MinConns = 10
	poolConfig.MaxConnLifetime = time.Hour

	// 2. Connect to Postgres
	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create pgx pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("PostgreSQL connection pool established successfully")

	return pool, nil
}
