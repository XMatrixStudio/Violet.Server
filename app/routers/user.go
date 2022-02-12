package routers

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/controllers/userctrls"
	"github.com/xmatrixstudio/violet.server/app/http_gen/userapi"
	"github.com/xmatrixstudio/violet.server/lib/validates"
)

type userRouter struct{}

func NewUserRouter() userapi.UserRouter {
	return &userRouter{}
}

func (router *userRouter) UserInfo(r *api.RequestContext) (*userapi.UserInfoResponse, error) {
	panic("implement me")
}

func (router *userRouter) UserLogin(r *api.RequestContext, req *userapi.UserLoginRequest) error {
	err := validates.Assert(
		validates.MakeItem(req.Email, api.ErrInvalidEmail, validation.Required, is.EmailFormat),
		validates.MakeItem(req.Password, api.ErrInvalidPassword, validation.Required, validation.Length(128, 128), is.Hexadecimal),
	)
	if err != nil {
		return err
	}

	return userctrls.NewUserLoginController(r, req).Do()
}

func (router *userRouter) UserLogout(r *api.RequestContext) error {
	panic("implement me")
}

func (router *userRouter) UserRegister(r *api.RequestContext, req *userapi.UserRegisterRequest) error {
	err := validates.Assert(
		validates.MakeItem(req.Email, api.ErrInvalidEmail, validation.Required, is.EmailFormat),
		validates.MakeItem(req.Password, api.ErrInvalidPassword, validation.Required, validation.Length(128, 128), is.Hexadecimal),
	)
	if err != nil {
		return err
	}

	return userctrls.NewUserRegisterController(r, req).Do()
}
