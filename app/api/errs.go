package api

import "fmt"

var (
	// [,9999] - 特殊状态码，禁止业务使用和预留
	Unknown = &Error{code: -1, message: "unknown"}
	Success = &Error{code: 0, message: "success"}

	// [10000,110000] - 通用状态码
	ErrSystemError    = &Error{code: 10001, message: "system_error"}
	ErrModuleError    = &Error{code: 10002, message: "module_error"}
	ErrDatabaseError  = &Error{code: 10003, message: "database_error"}
	ErrFileIOError    = &Error{code: 10004, message: "file_error"}
	ErrNetworkIOError = &Error{code: 10005, message: "network_error"}
	ErrBadRequest     = &Error{code: 10006, message: "bad_request"}

	// [110000, 120000] - 业务通用状态码
	ErrInvalidParam   = &Error{code: 110001, message: "invalid_param"}
	ErrPermissionDeny = &Error{code: 110002, message: "permission_deny"}
	ErrNotLogin       = &Error{code: 110003, message: "not_login"}
	ErrNotFound       = &Error{code: 110004, message: "not_found"}

	// [120000, 130000] - 用户模块
	ErrUserExist    = &Error{code: 120001, message: "user_exist"}
	ErrUserNotExist = &Error{code: 120002, message: "user_not_exist"}

	// [130000, 140000] - 工具模块
	ErrUtilCaptchaTimeout           = &Error{code: 130001, message: "captcha_timeout"}
	ErrUtilCaptchaWrongTicket       = &Error{code: 130002, message: "captcha_wrong_ticket"}
	ErrUtilCaptchaWrongBusinessName = &Error{code: 130003, message: "captcha_wrong_business_name"}
	ErrUtilCaptchaWrongValue        = &Error{code: 130004, message: "captcha_wrong_value"}
	ErrUtilEmailSendLimit           = &Error{code: 130011, message: "email_send_limit"}

	// [130000, 140000] - 租户模块
	// [140000, 150000] - 管理模块
	// [210000, 300000] - 开放API状态码
)

var (
	ErrInvalidBusinessName  = WithMessage(ErrInvalidParam, "invalid_business_name")
	ErrInvalidCaptcha       = WithMessage(ErrInvalidParam, "invalid_captcha")
	ErrInvalidEmailCode     = WithMessage(ErrInvalidParam, "invalid_email_code")
	ErrInvalidEmailTicket   = WithMessage(ErrInvalidParam, "invalid_email_ticket")
	ErrInvalidEmail         = WithMessage(ErrInvalidParam, "invalid_email")
	ErrInvalidNickname      = WithMessage(ErrInvalidParam, "invalid_nickname")
	ErrInvalidPassword      = WithMessage(ErrInvalidParam, "invalid_password")
	ErrInvalidPasswordAgain = WithMessage(ErrInvalidParam, "invalid_password_again")
	ErrInvalidTicket        = WithMessage(ErrInvalidParam, "invalid_ticket")
)

type Error struct {
	code    int32
	message string
}

func (err *Error) Error() string {
	return fmt.Sprintf("Code:%d Message:%s", err.code, err.message)
}

func WithMessage(err *Error, message string) *Error {
	return &Error{
		code:    err.code,
		message: message,
	}
}
