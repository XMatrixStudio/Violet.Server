package email

import "github.com/gin-gonic/gin"

type Service struct{}

func (s *Service) SendEmail(ctx *gin.Context, key string, data interface{}) error {
	return nil
}
