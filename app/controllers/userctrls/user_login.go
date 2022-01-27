package userctrls

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/http_gen/userapi"
)

type UserLoginController struct {
	r   *api.RequestContext
	req *userapi.UserLoginRequest
}

func NewUserLoginController(r *api.RequestContext, req *userapi.UserLoginRequest) *UserLoginController {
	return &UserLoginController{
		r:   r,
		req: req,
	}
}

func (ctrl *UserLoginController) Do() error {
	return nil
}
