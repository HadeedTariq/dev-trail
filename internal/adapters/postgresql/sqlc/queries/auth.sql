-- name: FindUserByEmail :one
SELECT * FROM users 
WHERE email = $1 
LIMIT 1;

-- name: FindUserByID :one
SELECT * FROM users 
WHERE id = $1 
LIMIT 1;

-- name: FindActiveOtp :one
SELECT * FROM email_otps 
WHERE email = $1 
  AND expires_at > NOW() 
ORDER BY created_at DESC 
LIMIT 1;

-- name: InsertEmailOtp :one
INSERT INTO email_otps (
    email,
    otp,
    expires_at
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: InsertUser :one
INSERT INTO users (
    user_name,
    email,
    password,
    gender
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: VerifyUserAndUpdateRefreshToken :one
UPDATE users
SET
    refresh_token = $1,
    is_verified = TRUE
WHERE email = $2
RETURNING id;