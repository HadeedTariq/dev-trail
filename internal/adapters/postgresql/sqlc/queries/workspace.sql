-- name: CreateWorkspace :one
INSERT INTO workspaces (
    name,
    created_by,
    image
)
VALUES (
    $1,
    $2,
    $3
)
RETURNING
    id,
    name,
    created_by,
    image,
    created_at,
    updated_at;


-- name: FindWorkspacesByUserID :many
SELECT
    id,
    name,
    created_by,
    image,
    created_at,
    updated_at
FROM workspaces
WHERE created_by = $1
ORDER BY created_at DESC;

-- name: UpdateWorkspace :one
UPDATE workspaces
SET
    name = $2,
    image = $3,
    updated_at = NOW()
WHERE id = $1 and created_by=$4
RETURNING
    id;


-- name: FindUserWorkspacesById :one
SELECT
    id,
    name,
    created_by,
    image,
    created_at,
    updated_at
FROM workspaces
WHERE id = $1 and created_by=$2;

-- name: DeleteWorkspace :one
DELETE FROM workspaces
WHERE id = $1 AND created_by = $2
RETURNING id, name, created_by, image, created_at, updated_at;

-- name: AddWorkspaceMember :one
INSERT INTO workspace_members (
    workspace_id,
    user_id,
    role,
    invited_by
) VALUES (
    $1, $2, $3, $4
)
RETURNING
    id,
    workspace_id,
    user_id,
    role,
    invited_by,
    joined_at,
    created_at,
    updated_at;

-- ~ workspace invitation related queries
-- name: FindMemberByWorkspaceAndEmail :one
SELECT wm.*
FROM workspace_members wm
JOIN users u ON u.id = wm.user_id
WHERE wm.workspace_id = $1
  AND LOWER(u.email) = LOWER($2)
LIMIT 1;

-- name: CreateWorkspaceInvitation :one
INSERT INTO workspace_invitations (
    workspace_id,
    email,
    invited_by,
    role,
    token,
    expires_at
) VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: FindInvitationByToken :one
SELECT *
FROM workspace_invitations
WHERE token = $1
  AND accepted_at IS NULL
  AND expires_at > NOW()
LIMIT 1;

-- name: FindPendingInvitationsByWorkspace :many
SELECT *
FROM workspace_invitations
WHERE workspace_id = $1
  AND accepted_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC;

-- name: FindPendingInvitationsByEmail :many
SELECT *
FROM workspace_invitations
WHERE email = $1
  AND accepted_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC;

-- name: FindPendingInvitationByWorkspaceAndEmail :one
SELECT *
FROM workspace_invitations
WHERE workspace_id = $1
  AND LOWER(email) = LOWER($2)
  AND accepted_at IS NULL
LIMIT 1;


-- name: AcceptInvitation :one
UPDATE workspace_invitations
SET
    accepted_at = NOW(),
    updated_at = NOW()
WHERE id = $1
  AND accepted_at IS NULL
RETURNING *;

-- name: DeleteInvitation :exec
DELETE FROM workspace_invitations
WHERE id = $1;

-- name: DeleteExpiredInvitations :exec
DELETE FROM workspace_invitations
WHERE expires_at < NOW()
  AND accepted_at IS NULL;