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