-- +goose Up
-- +goose StatementBegin

CREATE TABLE workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role workspace_role NOT NULL DEFAULT 'MEMBER',

    token VARCHAR(255) NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,  -- NULL until the invite is accepted

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- one active invite per email per workspace
    CONSTRAINT workspace_invitations_unique UNIQUE (workspace_id, email)
);

-- Fast lookups: "list invites for a workspace", "find invite by token",
-- "find pending invites for an email", "cleanup expired invites"
CREATE INDEX idx_workspace_invitations_workspace_id
    ON workspace_invitations (workspace_id);

CREATE INDEX idx_workspace_invitations_email
    ON workspace_invitations (email);

CREATE INDEX idx_workspace_invitations_token
    ON workspace_invitations (token);

CREATE INDEX idx_workspace_invitations_expires_at
    ON workspace_invitations (expires_at);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS workspace_invitations;

-- +goose StatementEnd