package util

import (
	"context"
	"strconv"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	sessionDal "github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/http_gen/util"
	"github.com/xmatrixstudio/violet.server/app/service/generator"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type GetCaptchaController struct {
	ctx              context.Context
	session          sessions.Session
	businessName     string
	captchaGenerator *generator.CaptchaGenerator
}

func NewGetCaptchaController(ctx context.Context, businessName string) *GetCaptchaController {
	return &GetCaptchaController{
		ctx:              ctx,
		session:          sessions.Default(ctx.(*gin.Context)),
		businessName:     businessName,
		captchaGenerator: generator.Helper.CaptchaGenerator,
	}
}

func (ctrl *GetCaptchaController) Fetch() (*util.GetCaptchaResponse, error) {
	now := time.Now().Unix()
	data, str, err := ctrl.captchaGenerator.GenBase64Captcha()
	if err != nil {
		logs.CtxError(ctrl.ctx, "call GenBase64Captcha fail", zap.Error(err))
		return nil, err
	}
	sessionDal.SetCaptcha(ctrl.session, str, ctrl.businessName, now+5*60)
	return &util.GetCaptchaResponse{CaptchaData: data, Ticket: strconv.FormatInt(now, 10)}, nil
}
