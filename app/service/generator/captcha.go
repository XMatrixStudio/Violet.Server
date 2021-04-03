package generator

import (
	"bytes"
	"encoding/base64"
	"image/png"

	"github.com/afocus/captcha"
	"go.uber.org/zap"
)

type captchaGenerator struct {
	captcha *captcha.Captcha
}

func newCaptchaGenerator() *captchaGenerator {
	c := captcha.New()
	err := c.SetFont("static/comic.ttf")
	if err != nil {
		zap.L().Fatal("Call captcha.SetFont fail", zap.Error(err))
	}
	return &captchaGenerator{captcha: c}
}

func (gen *captchaGenerator) GenBase64Captcha() (string, string, error) {
	image, str := gen.captcha.Create(4, captcha.NUM)
	buf := bytes.NewBuffer(nil)
	if err := png.Encode(buf, image); err != nil {
		return "", "", err
	}
	data := base64.StdEncoding.EncodeToString(buf.Bytes())
	return data, str, nil
}
