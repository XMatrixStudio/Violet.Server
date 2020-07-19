package captcha

import (
	"bytes"
	"encoding/base64"
	"image/png"
	"time"

	"github.com/afocus/captcha"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type Service struct {
	Cap *captcha.Captcha `inject:""`
}

func (s *Service) GetCaptcha(ctx *gin.Context, key string, duration time.Duration) string {
	image, str := s.Cap.Create(4, captcha.NUM)
	buf := bytes.NewBuffer(nil)
	_ = png.Encode(buf, image)
	data := base64.StdEncoding.EncodeToString(buf.Bytes())

	session := sessions.Default(ctx)
	session.Set(SessionKeyCaptcha, str)
	session.Set(SessionKeyCaptchaKey, key)
	session.Set(SessionKeyCaptchaExpireTime, time.Now().Add(duration).Unix())
	return data
}
