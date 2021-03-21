package user

import (
	"fmt"

	"github.com/xmatrixstudio/violet.server/app/dal/store"
	"github.com/xmatrixstudio/violet.server/app/http_gen/user"
	"github.com/xmatrixstudio/violet.server/app/result"
	"github.com/xmatrixstudio/violet.server/lib/cryptos"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type RegisterController struct {
	rp  *result.RequestParam
	req user.RegisterRequest
}

func NewRegisterController(rp *result.RequestParam, req user.RegisterRequest) *RegisterController {
	return &RegisterController{
		rp:  rp,
		req: req,
	}
}

func (ctrl *RegisterController) Do() error {
	user, err := store.UserStore.FindOne(ctrl.rp.Ctx(), store.User{Email: ctrl.req.Email})
	if err != nil {
		logs.Error(ctrl.rp.Ctx(), "find user by email fail", zap.Error(err))
		return err
	}
	fmt.Println(user)

	if user != nil {
		return result.ErrUserExist
	}

	passwordSalt := cryptos.RandString(64)
	password := cryptos.Sha512(cryptos.Sha512(ctrl.req.Password) + passwordSalt)
	user = &store.User{
		Email:        ctrl.req.Email,
		Password:     password,
		PasswordSalt: passwordSalt,
	}
	err = store.UserStore.Create(ctrl.rp.Ctx(), user)
	if err != nil {
		logs.Error(ctrl.rp.Ctx(), "create user fail", zap.Error(err))
	}

	return nil
}
