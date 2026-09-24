-- +goose Up
-- +goose StatementBegin

-- Role enum: OWNER, ADMIN, MEMBER, VIEWER
CREATE TYPE workspace_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role workspace_role NOT NULL DEFAULT 'MEMBER',

    -- who invited / added this member (nullable for the initial owner)
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- a user can only be a member of a workspace once
    CONSTRAINT workspace_members_unique UNIQUE (workspace_id, user_id)
);

-- Fast lookups: "list members of a workspace" and "list workspaces for a user"
CREATE INDEX idx_workspace_members_workspace_id
    ON workspace_members (workspace_id);

CREATE INDEX idx_workspace_members_user_id
    ON workspace_members (user_id);

-- Composite index for the most common permission check:
-- "is user X a member of workspace Y, and what role?"
CREATE INDEX idx_workspace_members_workspace_user
    ON workspace_members (workspace_id, user_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS workspace_members;
DROP TYPE IF EXISTS workspace_role;

-- +goose StatementEnd