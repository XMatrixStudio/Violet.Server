package handler

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	userCtrl "github.com/xmatrixstudio/violet.server/app/controller/user"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_user"
	vd "github.com/xmatrixstudio/violet.server/lib/validates"
	"go.uber.org/zap"
)

// Register 用户注册
func Register(r *api.RequestContext) api.Result {
	req := api_user.RegisterRequest{}
	if err := r.Ctx().ShouldBindJSON(&req); err != nil {
		return r.OnError(api.ErrBadRequest)
	}
	err := vd.Assert(
		vd.I{V: vd.NewStringValidator(req.Email).MustEmail(), E: api.ErrInvalidEmail},
		vd.I{V: vd.NewStringValidator(req.Password).MustHex().MustLen(128, 128), E: api.ErrInvalidPassword},
	)
	if err != nil {
		return r.OnError(err)
	}

	r.Logger().Info("call Register", zap.String("email", req.Email))
	ctrl := userCtrl.NewRegisterController(r, req)
	return r.OnDo(ctrl.Do())
}
