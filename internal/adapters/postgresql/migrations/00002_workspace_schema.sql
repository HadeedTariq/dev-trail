-- +goose Up

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_created_by
ON workspaces(created_by);


-- +goose Down

DROP INDEX IF EXISTS idx_workspaces_created_by;

DROP TABLE IF EXISTS workspaces;
