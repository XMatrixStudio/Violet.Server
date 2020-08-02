package result

const (
	CodeOk = 200
)

type StandardError struct {
	ErrorCode int
	ErrorMsg  string
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
	SystemError     = StandardError{101000, "system error"}
	ModuleError     = StandardError{101100, "module error"}
	DatabaseError   = StandardError{101200, "database error"}
	FileIOError     = StandardError{101300, "file error"}
	NetworkIOError  = StandardError{101400, "network error"}
	ParametersError = StandardError{102100, "invalid parameter"}
	PrivilegeError  = StandardError{102200, "permission denied"}
)

// Global* 全局错误: 1*
var (
	GlobalKeyError      = StandardError{110001, "invalid key"}
	GlobalPageError     = StandardError{110002, "invalid page"}
	GlobalPageSizeError = StandardError{110003, "invalid page_size"}
)

// Captcha* 验证码模块错误: 21
var (
	CaptchaGenerateError = StandardError{212301, "captcha generate error"}
)

// User* 用户模块错误: 22
var (
	UserEmailError           = StandardError{222301, "email duplicate"}
	UserPasswordConfirmError = StandardError{222102, "password confirmation error"}
)
