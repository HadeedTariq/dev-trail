package utils

import (
	"github.com/HadeedTariq/dev-trail/internal/config"
	"github.com/cloudinary/cloudinary-go/v2"
)

func NewCloudinary(cfg config.CloudinaryConfig) (*cloudinary.Cloudinary, error) {
	cld, err := cloudinary.NewFromParams(
		cfg.CLOUDINARY_CLOUD_NAME,
		cfg.CLOUDINARY_API_KEY,
		cfg.CLOUDINARY_API_SECRET,
	)
	if err != nil {
		return nil, err
	}

	return cld, nil
}
