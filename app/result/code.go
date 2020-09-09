package result

const (
	CodeOk                  = 200
	CodeInternalServerError = 500
)

type Error struct {
	ErrCode int
	ErrMsg  string
}

func (err *Error) Error() string {
	return ""
}

// 错误码由 模块-错误类型-错误编码 组成
// 模块由 2 个整型数字组成，错误类型由 2 个整型数字组组成，错误编码由 2 个整型数字组成
//
// 错误类型划分：
// 1*: 系统级别错误
// 10: 通用系统错误
// 11: 通用模块错误
// 12: 数据库错误
// 13: 文件 IO 错误
// 14: 网络 IO 错误
//
// 2*: 业务级别错误
// 21: 参数错误
// 22: 权限错误
// 23: 其他

// 通用错误: 10
var (
	SystemError     = Error{101000, "system error"}
	ModuleError     = Error{101100, "module error"}
	DatabaseError   = Error{101200, "database error"}
	FileIOError     = Error{101300, "file error"}
	NetworkIOError  = Error{101400, "network error"}
	ParametersError = Error{102100, "invalid parameter"}
	PrivilegeError  = Error{102200, "permission denied"}
)

const (
	invalidCaptcha = 120001 + iota
	invalidEmail
	invalidType
)

// Global* 全局错误: 1*
var (
	InvalidParameter    = &Error{110001, "invalid_parameter"}
	GlobalKeyError      = Error{110001, "invalid key"}
	GlobalPageError     = Error{110002, "invalid page"}
	GlobalPageSizeError = Error{110003, "invalid page_size"}

	InvalidCaptcha = &Error{invalidCaptcha, "invalid_captcha"}
	InvalidEmail   = &Error{invalidEmail, "invalid_captcha"}
	InvalidType    = &Error{invalidType, "invalid_type"}
)

// Captcha* 验证码模块错误: 21
var (
	CaptchaGenerateError = Error{212301, "captcha generate error"}
)

// User* 用户模块错误: 22
var (
	UserEmailError           = Error{222301, "email duplicate"}
	UserPasswordConfirmError = Error{222102, "password confirmation error"}
)
