package session

import (
	"errors"
	"time"

	"github.com/gin-contrib/sessions"
)

const (
	KeyCaptcha             = "captcha"
	KeyCaptchaBusinessName = "captchaBusinessName"
	KeyCaptchaExpireTime   = "captchaExpireTime"
)

var (
	ErrCaptchaTimeout = errors.New("captcha timeout")
	ErrCaptchaWrong = errors.New("captcha wrong")
	ErrCaptchaWrongBusiness = errors.New("captcha wrong business")
)

func CheckCaptcha(session sessions.Session, captcha, businessName string) error {
	if expectExpireTime := getInt64(session, KeyCaptchaExpireTime, 0); time.Now().Unix() > expectExpireTime {
		return ErrCaptchaTimeout
	}
	if expectBusinessName := getString(session, businessName, ""); businessName !=  expectBusinessName {
		return ErrCaptchaWrongBusiness
	}
	if expectCaptcha := getString(session, KeyCaptcha, ""); captcha != expectCaptcha {
		return ErrCaptchaWrong
	}
	return nil
}

func SetCaptcha(session sessions.Session, captcha, businessName string, expireTime int64) {
	session.Set(KeyCaptcha, captcha)
	session.Set(KeyCaptchaBusinessName, businessName)
	session.Set(KeyCaptchaExpireTime, expireTime)
}
