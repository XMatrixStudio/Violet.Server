package config

import (
	"fmt"

	"github.com/afocus/captcha"
	"github.com/xmatrixstudio/violet.server/lib/inject"
)

func NewCaptcha() *captcha.Captcha {
	cap := captcha.New()
	err := cap.SetFont("static/comic.ttf")
	if err != nil {
		panic(fmt.Sprintf("config.NewCaptcha: %s", err))
	}
	return cap
}

func NewInject() *inject.Injector {
	injector := inject.New()
	injector.Register(NewCaptcha())
	return injector
}
