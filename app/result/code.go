package result

const (
	CodeOk = 200
)

type StandardError struct {
	ErrorCode int
	ErrorMsg  string
}

// 错误码由 模块-错误类型-错误编码 组成
// 模块由 3 个整型数字组成，错误类型由 2 个整型数字组组成，错误编码由 3 个整型数字组成
//
// 错误类型划分：
// 1*: 系统级别错误
// 11: 数据库错误
// 12: 文件 IO 错误
// 13: 网络 IO 错误
//
// 2*: 业务级别错误
// 21: 参数错误
// 22: 权限不足
// 23: 其他

// 通用错误
var (
	ParametersError = StandardError{10021001, "invalid parameter"}
	KeyError        = StandardError{10021002, "invalid key"}
)

// 验证码模块错误: 201
var (
	CaptchaGenerateError = StandardError{20123001, "captcha generate error"}
)

// 用户模块错误: 202
var (
	EmailError           = StandardError{20223001, "email duplicate"}
	PasswordConfirmError = StandardError{20223002, "password confirmation error"}
)
