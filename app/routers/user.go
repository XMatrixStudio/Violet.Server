package routers

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/controllers/userctrls"
	"github.com/xmatrixstudio/violet.server/app/http_gen/userapi"
)

type userRouter struct{}

func NewUserRouter() userapi.UserRouter {
	return &userRouter{}
}

func (router *userRouter) UserInfo(r *api.RequestContext) (*userapi.UserInfoResponse, error) {
	panic("implement me")
}

func (router *userRouter) UserLogin(r *api.RequestContext, req *userapi.UserLoginRequest) error {
	return userctrls.NewUserLoginController(r, req).Do()
}

func (router *userRouter) UserLogout(r *api.RequestContext) error {
	panic("implement me")
}

func (router *userRouter) UserRegister(r *api.RequestContext, req *userapi.UserRegisterRequest) error {
	return userctrls.NewUserRegisterController(r, req).Do()
}
