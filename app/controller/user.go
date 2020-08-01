package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/module/email"
	"github.com/xmatrixstudio/violet.server/app/module/user"
	"github.com/xmatrixstudio/violet.server/app/result"
)

type UserController struct {
	EmailService *email.Service `inject:""`
	UserService  *user.Service  `inject:""`
}

func (c *UserController) PostEmail(ctx *gin.Context) *result.Resp {
	return result.OnSuccess()
}
