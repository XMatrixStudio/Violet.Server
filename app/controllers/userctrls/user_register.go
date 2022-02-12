package userctrls

import (
	"strings"

	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/consts"
	"github.com/xmatrixstudio/violet.server/app/dal/entity"
	"github.com/xmatrixstudio/violet.server/app/dal/repos"
	"github.com/xmatrixstudio/violet.server/app/http_gen/userapi"
	"github.com/xmatrixstudio/violet.server/app/services/algorithms"
	"go.uber.org/zap"
)

type UserRegisterController struct {
	r        *api.RequestContext
	req      *userapi.UserRegisterRequest
	userRepo repos.UserRepository
}

func NewUserRegisterController(r *api.RequestContext, req *userapi.UserRegisterRequest) *UserRegisterController {
	return &UserRegisterController{
		r:        r,
		req:      req,
		userRepo: repos.NewUserRepository(),
	}
}

func (c *UserRegisterController) Do() error {
	// 判断邮箱是否已被注册
	user, err := c.userRepo.FindOne(c.r.Ctx(), entity.User{Email: c.req.Email})
	if err != nil {
		c.r.Logger().Error("find user by email fail", zap.Error(err))
		return err
	}

	if user != nil {
		c.r.Logger().Error("user already exist", zap.String("email", c.req.Email))
		return api.ErrUserExist
	}

	// 处理密码
	signParam := algorithms.SignParam{RawData: strings.ToLower(c.req.Password)}
	algo := algorithms.NewSignProcessor(consts.DefaultSignAlgorithm)
	password, err := algo.Sign(&signParam)
	if err != nil {
		c.r.Logger().Error("algo sign fail", zap.Error(err))
		return err
	}

	// 注册用户
	user = &entity.User{
		Email:        c.req.Email,
		Password:     password,
		PasswordSalt: signParam.Salt,
		Role:         0,
	}
	err = c.userRepo.Save(c.r.Ctx(), user)
	if err != nil {
		c.r.Logger().Error("save user fail", zap.Error(err))
		return err
	}

	c.r.Logger().Info("user register success", zap.String("email", user.Email))
	return nil
}
