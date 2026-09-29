package handler

import repo "github.com/HadeedTariq/dev-trail/internal/adapters/postgresql/sqlc"

// internal/handlers/auth/helpers.go (or inline in the same file)

func extractUserIDFromUser(user *repo.User) string {
	if !user.ID.Valid {
		return ""
	}
	value, err := user.ID.Value()
	if err != nil || value == nil {
		return ""
	}
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}

func extractUserEmailFromUser(user *repo.User) string {
	return user.Email.String // or .Email depending on how repo generates it
}

func safeTokenPrefix(token string) string {
	if len(token) <= 8 {
		return "…"
	}
	return token[:8] + "…"
}
