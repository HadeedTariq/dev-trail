package utils

import (
	"crypto/rand"
	"math/big"
)

// GenerateOTP generates a cryptographically secure numeric OTP of given length.
func GenerateOTP(length int) (string, error) {
	const digits = "0123456789"
	otp := make([]byte, length)

	for i := 0; i < length; i++ {
		// Pick a random index from 0 to 9
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		otp[i] = digits[num.Int64()]
	}

	return string(otp), nil
}
