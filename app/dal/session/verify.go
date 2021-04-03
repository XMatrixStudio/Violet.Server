package session

import (
	"github.com/json-iterator/go"
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/lib/cryptos"
	"go.uber.org/zap"
)

const (
	KeyCaptcha = "captcha"
	KeyEmail   = "email"
)

type captchaRecord struct {
	Value        string `json:"v"`
	BusinessName string `json:"b"`
	ExpireTime   int64  `json:"e"`
}

// CheckCaptcha 校验图形验证码
// 会校验票据、业务线、时效性、验证码准确性
func CheckCaptcha(r *api.RequestContext, captcha, businessName, ticket string) error {
	value := getStringFromSession(r.Session(), KeyCaptcha, "")
	if value == "" {
		return api.ErrUtilCaptchaTimeout
	}
	if valueTicket := cryptos.MD5(value); valueTicket != ticket {
		return api.ErrUtilCaptchaWrongTicket
	}

	record := captchaRecord{}
	if err := jsoniter.UnmarshalFromString(value, &record); err != nil {
		r.Logger().Error("jsoniter.UnmarshalFromString fail", zap.String("value", value), zap.Error(err))
		return err
	}

	if record.ExpireTime < r.Now().Unix() {
		return api.ErrUtilCaptchaTimeout
	} else if record.BusinessName != businessName {
		return api.ErrUtilCaptchaWrongBusinessName
	} else if record.Value != captcha {
		return api.ErrUtilCaptchaWrongValue
	}
	r.Session().Delete(KeyCaptcha)
	return nil
}

// SetCaptcha 记录图形验证码并返回票据
// 返回的票据用于图形验证码合法性校验
func SetCaptcha(r *api.RequestContext, captcha, businessName string, expireTime int64) (string, error) {
	record := captchaRecord{Value: captcha, BusinessName: businessName, ExpireTime: expireTime}
	value, err := jsoniter.MarshalToString(record)
	if err != nil {
		r.Logger().Error("jsoniter.MarshalToString fail", zap.Error(err))
		return "", err
	}
	ticket := cryptos.MD5(value)
	r.Session().Set(KeyCaptcha, value)
	return ticket, nil
}

type emailRecord struct {
	Email        string `json:"u"` // 邮箱地址
	Value        string `json:"v"` // 邮箱验证码
	BusinessName string `json:"b"` // 验证用途
	ExpireTime   int64  `json:"e"` // 验证码过期时间
	NextTime     int64  `json:"n"` // 下一次可以发送邮件时间
}

// CheckCanSendEmail 校验是否可以发送邮件
// 两次发送邮件之间会有频控
func CheckCanSendEmail(r *api.RequestContext, email string) error {
	value := getStringFromSession(r.Session(), KeyEmail, "")
	// 找不到记录，允许发送邮件
	if value == "" {
		return nil
	}

	record := emailRecord{}
	if err := jsoniter.UnmarshalFromString(value, &record); err != nil {
		r.Logger().Error("jsoniter.UnmarshalFromString fail", zap.String("value", value), zap.Error(err))
		return err
	}
	// 两次请求邮箱地址不同，允许发送邮件
	if record.Email != email {
		return nil
	}
	// 已到达可发送邮件时间，允许发送邮件
	if record.NextTime < r.Now().Unix() {
		return nil
	}
	return api.ErrUtilEmailSendLimit
}

// SetEmail 记录邮箱验证码并返回票据
// 返回的票据用于邮箱验证码合法性校验
func SetEmail(r *api.RequestContext, email, code, businessName string, expireTime, nextTime int64) (string, error) {
	record := emailRecord{Email: email, Value: code, BusinessName: businessName, ExpireTime: expireTime, NextTime: nextTime}
	value, err := jsoniter.MarshalToString(record)
	if err != nil {
		r.Logger().Error("jsoniter.MarshalToString fail", zap.Error(err))
		return "", err
	}
	ticket := cryptos.MD5(value)
	r.Session().Set(KeyEmail, value)
	return ticket, nil
}
