package result

var (
	// [,9999] - 特殊状态码，禁止业务使用和预留
	Unknown = &Error{code: -1, msg: "unknown"}
	Success = &Error{code: 0, msg: "success"}

	// [10000,110000] - 通用状态码
	ErrSystemError    = &Error{code: 10001, msg: "system_error"}
	ErrModuleError    = &Error{code: 10002, msg: "module_error"}
	ErrDatabaseError  = &Error{code: 10003, msg: "database_error"}
	ErrFileIOError    = &Error{code: 10004, msg: "file_error"}
	ErrNetworkIOError = &Error{code: 10005, msg: "network_error"}
	ErrBadRequest     = &Error{code: 10006, msg: "bad_request"}

	// [110000, 120000] - 业务通用状态码
	ErrInvalidParam   = &Error{code: 110001, msg: "invalid_param"}
	ErrPermissionDeny = &Error{code: 110002, msg: "permission_deny"}
	ErrNotLogin       = &Error{code: 110003, msg: "not_login"}
	ErrNotFound       = &Error{code: 110004, msg: "not_found"}

	// [120000, 130000] - 用户模块
	ErrUserExist = &Error{code: 120001, msg: "user_exist"}

	// [130000, 140000] - 租户模块
	// [140000, 150000] - 管理模块
	// [210000, 300000] - 开放API状态码
)

var (
	ErrInvalidEmail    = WithMsg(ErrInvalidParam, "invalid_email")
	ErrInvalidPassword = WithMsg(ErrInvalidParam, "invalid_password")
	ErrInvalidPhone    = WithMsg(ErrInvalidParam, "invalid_param")
)

type Error struct {
	code int32
	msg  string
}

func (err *Error) Error() string {
	return err.msg
}

func WithMsg(err *Error, msg string) *Error {
	return &Error{
		code: err.code,
		msg:  msg,
	}
}