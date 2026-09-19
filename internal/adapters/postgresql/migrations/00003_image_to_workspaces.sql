-- +goose Up

ALTER TABLE workspaces
ADD COLUMN image TEXT;

-- +goose Down

ALTER TABLE workspaces
DROP COLUMN IF EXISTS image;