package user

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_user"
)

type LoginController struct {
	r   *api.RequestContext
	req api_user.LoginRequest
}

func NewLoginController(r *api.RequestContext, req api_user.LoginRequest) *LoginController {
	return &LoginController{
		r:   r,
		req: req,
	}
}

func (ctrl *LoginController) Do() error {
	return nil
}
