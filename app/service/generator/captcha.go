package generator

import (
	"bytes"
	"encoding/base64"
	"image/png"

	"github.com/afocus/captcha"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type CaptchaGenerator struct {
	captcha *captcha.Captcha
}

func NewCaptchaGenerator() *CaptchaGenerator {
	c := captcha.New()
	err := c.SetFont("static/comic.ttf")
	if err != nil {
		logs.Fatal("call captcha.SetFont fail", zap.Error(err))
	}
	return &CaptchaGenerator{captcha: c}
}

func (generator *CaptchaGenerator) GenBase64Captcha() (string, string, error) {
	image, str := generator.captcha.Create(4, captcha.NUM)
	buf := bytes.NewBuffer(nil)
	err := png.Encode(buf, image)
	if err != nil {
		return "", "", err
	}
	data := base64.StdEncoding.EncodeToString(buf.Bytes())
	return data, str, nil
}
