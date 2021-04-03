package sender

import (
	"sync"

	"github.com/xmatrixstudio/violet.server/app/config"
)

var (
	EmailSender *emailSender
	once        sync.Once
)

func InitSender(cfg config.Config) {
	once.Do(func() {
		EmailSender = newEmailSender(cfg)
	})
}
