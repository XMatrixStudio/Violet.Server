package sender

import "sync"

var (
	Helper helper
	once   sync.Once
)

type helper struct {
	EmailSender *EmailSender
}

func InitSender() {
	once.Do(func() {
		Helper.EmailSender = NewEmailSender()
	})
}
