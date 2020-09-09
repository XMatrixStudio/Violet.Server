package session

import (
	"github.com/gin-contrib/sessions"
)

const (
	KeyCaptcha             = "captcha"
	KeyCaptchaBusinessName = "captchaBusinessName"
	KeyCaptchaExpireTime   = "captchaExpireTime"
)

func SetCaptcha(session sessions.Session, captcha, businessName string, expireTime int64) {
	session.Set(KeyCaptcha, captcha)
	session.Set(KeyCaptchaBusinessName, businessName)
	session.Set(KeyCaptchaExpireTime, expireTime)
}
