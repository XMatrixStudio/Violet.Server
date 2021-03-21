package handler

import (
	userCtrl "github.com/xmatrixstudio/violet.server/app/controller/user"
	"github.com/xmatrixstudio/violet.server/app/http_gen/user"
	r "github.com/xmatrixstudio/violet.server/app/result"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	v "github.com/xmatrixstudio/violet.server/lib/validates"
	"go.uber.org/zap"
)

// Register 用户注册
func Register(rp *r.RequestParam) r.Result {
	req := user.RegisterRequest{}
	if err := rp.Ctx().ShouldBindJSON(&req); err != nil {
		return r.OnError(rp.Ctx(), r.ErrBadRequest)
	}
	err := v.Assert(
		v.I{V: v.NewStringValidator(req.Email).MustEmail(), E: r.ErrInvalidEmail},
		v.I{V: v.NewStringValidator(req.Password).MustHex().MustLen(128, 128), E: r.ErrInvalidPassword},
	)
	if err != nil {
		return r.OnError(rp.Ctx(), err)
	}

	logs.Info(rp.Ctx(), "call Register", zap.String("email", req.Email))
	ctrl := userCtrl.NewRegisterController(rp, req)
	return r.OnDo(rp.Ctx(), ctrl.Do())
}
