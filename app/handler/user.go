package handler

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	userCtrl "github.com/xmatrixstudio/violet.server/app/controller/user"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_user"
	vd "github.com/xmatrixstudio/violet.server/lib/validates"
	"go.uber.org/zap"
)

const (
	lenEmailCode = 5
	lenPassword  = 128
)

// Login 用户登陆
func Login(r *api.RequestContext) api.Result {
	req := api_user.LoginRequest{}
	if err := r.ShouldBindJSON(&req); err != nil {
		return r.OnError(api.ErrBadRequest)
	}
	err := vd.Assert(
		vd.I{V: vd.NewStringValidator(req.Email).MustEmail(), E: api.ErrInvalidEmail},
		vd.I{V: vd.NewStringValidator(req.Password).MustHex().MustLen(lenPassword, lenPassword), E: api.ErrInvalidPassword},
	)
	if err != nil {
		return r.OnError(err)
	}

	r.Logger().Info("API Register", zap.String("email", req.Email))
	return r.OnDo(userCtrl.NewLoginController(r, req).Do())
}

// Register 用户注册
func Register(r *api.RequestContext) api.Result {
	req := api_user.RegisterRequest{}
	if err := r.ShouldBindJSON(&req); err != nil {
		return r.OnError(api.ErrBadRequest)
	}
	err := vd.Assert(
		vd.I{V: vd.NewStringValidator(req.Email).MustEmail(), E: api.ErrInvalidEmail},
		vd.I{V: vd.NewStringValidator(req.EmailCode).MustLen(lenEmailCode, lenEmailCode), E: api.ErrInvalidEmailCode},
		vd.I{V: vd.NewStringValidator(req.Password).MustHex().MustLen(lenPassword, lenPassword), E: api.ErrInvalidPassword},
	)
	if err != nil {
		return r.OnError(err)
	}

	r.Logger().Info("API Register", zap.String("email", req.Email))
	return r.OnDo(userCtrl.NewRegisterController(r, req).Do())
}
