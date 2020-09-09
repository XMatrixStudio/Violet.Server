package generator

import "sync"

var (
	Captcha *CaptchaGenerator
	once    sync.Once
)

func InitGenerator() {
	once.Do(func() {
		Captcha = NewCaptchaGenerator()
	})
}
