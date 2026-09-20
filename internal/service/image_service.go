package service

import (
	"context"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type imageService struct {
	cloudinaryClient *cloudinary.Cloudinary
}

func NewImageService(cloudinaryClient *cloudinary.Cloudinary) ImageService {
	return &imageService{
		cloudinaryClient: cloudinaryClient,
	}
}

func (s *imageService) Upload(
	ctx context.Context,
	file *multipart.FileHeader,
) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	uploadResult, err := s.cloudinaryClient.Upload.Upload(
		ctx,
		src,
		uploader.UploadParams{
			Folder: "noorwall",
		},
	)
	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}
