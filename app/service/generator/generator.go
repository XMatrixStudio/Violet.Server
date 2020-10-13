package generator

import "sync"

var (
	Helper helper
	once   sync.Once
)

type helper struct {
	CaptchaGenerator *CaptchaGenerator
}

func InitGenerator() {
	once.Do(func() {
		Helper.CaptchaGenerator = NewCaptchaGenerator()
	})
}
