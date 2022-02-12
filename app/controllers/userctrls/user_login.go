package userctrls

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/dal/entity"
	"github.com/xmatrixstudio/violet.server/app/dal/repos"
	"github.com/xmatrixstudio/violet.server/app/http_gen/userapi"
	"go.uber.org/zap"
)

type UserLoginController struct {
	r        *api.RequestContext
	req      *userapi.UserLoginRequest
	userRepo repos.UserRepository
}

func NewUserLoginController(r *api.RequestContext, req *userapi.UserLoginRequest) *UserLoginController {
	return &UserLoginController{
		r:        r,
		req:      req,
		userRepo: repos.NewUserRepository(),
	}
}

func (c *UserLoginController) Do() error {
	// 获取用户信息
	user, err := c.userRepo.FindOne(c.r.Ctx(), entity.User{Email: c.req.Email})
	if err != nil {
		c.r.Logger().Error("find user by email fail", zap.Error(err))
		return err
	}

	if user == nil {
		c.r.Logger().Error("user not exist", zap.String("email", c.req.Email))
		return api.ErrUserNotExist
	}

	// TODO: 记录用户登陆状态

	return nil
}
