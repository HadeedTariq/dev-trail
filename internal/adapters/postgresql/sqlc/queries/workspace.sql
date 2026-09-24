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