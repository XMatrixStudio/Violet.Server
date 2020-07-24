package config

import (
	"fmt"
	"io/ioutil"

	"github.com/afocus/captcha"
	"github.com/xmatrixstudio/violet.server/lib/inject"
	"gopkg.in/yaml.v3"
)

func NewCaptcha() *captcha.Captcha {
	cap := captcha.New()
	err := cap.SetFont("static/comic.ttf")
	if err != nil {
		panic(fmt.Sprintf("config.NewCaptcha: %s", err))
	}
	return cap
}

func NewConfig() *Config {
	bytes, err := ioutil.ReadFile("config.yaml")
	if err != nil {
		panic(err)
	}
	config := &Config{}
	err = yaml.Unmarshal(bytes, config)
	if err != nil {
		panic(err)
	}
	return config
}

func NewInject() *inject.Injector {
	injector := inject.New()
	injector.Register(NewCaptcha())
	injector.Register(NewConfig())
	return injector
}
