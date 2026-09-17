package validator

import (
	"regexp"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	hasLower      = regexp.MustCompile(`[a-z]`)
	hasUpper      = regexp.MustCompile(`[A-Z]`)
	hasNumber     = regexp.MustCompile(`[0-9]`)
	hasSpecial    = regexp.MustCompile(`[^A-Za-z0-9]`)
)

func RegisterCustomValidations() {
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// Custom tag: alphanum_underscore
		_ = v.RegisterValidation("alphanum_underscore", func(fl validator.FieldLevel) bool {
			return usernameRegex.MatchString(fl.Field().String())
		})

		// Custom tag: strong_password (checks all 4 regex requirements)
		_ = v.RegisterValidation("strong_password", func(fl validator.FieldLevel) bool {
			pass := fl.Field().String()
			return hasLower.MatchString(pass) &&
				hasUpper.MatchString(pass) &&
				hasNumber.MatchString(pass) &&
				hasSpecial.MatchString(pass)
		})
	}
}
