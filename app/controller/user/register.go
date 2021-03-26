package user

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/dal/store"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_user"
	"github.com/xmatrixstudio/violet.server/lib/cryptos"
	"go.uber.org/zap"
)

type RegisterController struct {
	r   *api.RequestContext
	req api_user.RegisterRequest
}

func NewRegisterController(r *api.RequestContext, req api_user.RegisterRequest) *RegisterController {
	return &RegisterController{
		r:   r,
		req: req,
	}
}

func (ctrl *RegisterController) Do() error {
	user, err := store.UserStore.FindOne(ctrl.r.Ctx(), store.User{Email: ctrl.req.Email})
	if err != nil {
		ctrl.r.Logger().Error("find user by email fail", zap.Error(err))
		return err
	}

	if user != nil {
		return api.ErrUserExist
	}

	passwordSalt := cryptos.RandString(64)
	password := cryptos.Sha512(cryptos.Sha512(ctrl.req.Password) + passwordSalt)
	user = &store.User{
		Email:        ctrl.req.Email,
		Password:     password,
		PasswordSalt: passwordSalt,
	}
	err = store.UserStore.Create(ctrl.r.Ctx(), user)
	if err != nil {
		ctrl.r.Logger().Error("create user fail", zap.Error(err))
	}

	return nil
}
