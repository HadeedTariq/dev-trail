-- +goose Up
-- SQL in this section is executed when the migration is applied.

-- 1. Enable required extension for gen_random_uuid() if using older PostgreSQL versions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create ENUM types
CREATE TYPE role AS ENUM ('customer', 'admin', 'vendor');
CREATE TYPE source AS ENUM ('google', 'facebook', 'whatsapp', 'general');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');

-- 3. Create 'users' table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    password TEXT,
    role role NOT NULL DEFAULT 'customer',
    source source NOT NULL DEFAULT 'general',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    gender user_gender,
    refresh_token TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create 'email_otps' table
CREATE TABLE email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create 'password_reset_tokens' table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_password_reset_tokens_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- 6. Indexes for query optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_email_otps_email ON email_otps(email);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);


-- +goose Down
-- SQL in this section is executed when the migration is rolled back.

-- Drop tables in reverse order of creation (handling Foreign Keys properly)
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS email_otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom ENUM types
DROP TYPE IF EXISTS user_gender;
DROP TYPE IF EXISTS source;
DROP TYPE IF EXISTS role;