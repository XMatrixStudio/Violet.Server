package generator

import "sync"

var (
	CaptchaGenerator *captchaGenerator
	once             sync.Once
)

func InitGenerator() {
	once.Do(func() {
		CaptchaGenerator = newCaptchaGenerator()
	})
}
