package util

import (
	"fmt"

	sessionDal "github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/http_gen/util"
	"github.com/xmatrixstudio/violet.server/app/result"
	"github.com/xmatrixstudio/violet.server/app/service/generator"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type GetCaptchaController struct {
	rp               *result.RequestContext
	businessName     string
	captchaGenerator *generator.CaptchaGenerator
}

func NewGetCaptchaController(rp *result.RequestContext, businessName string) *GetCaptchaController {
	return &GetCaptchaController{
		rp:               rp,
		businessName:     businessName,
		captchaGenerator: generator.Helper.CaptchaGenerator,
	}
}

func (ctrl *GetCaptchaController) Fetch() (*api_util.GetCaptchaResponse, error) {
	now := ctrl.rp.Now().Unix()
	data, str, err := ctrl.captchaGenerator.GenBase64Captcha()
	if err != nil {
		logs.CtxError(ctrl.rp.GinCtx(), "call GenBase64Captcha fail", zap.Error(err))
		return nil, err
	}
	ticket := fmt.Sprintf("%s_%d", ctrl.businessName, now)
	sessionDal.SetCaptcha(ctrl.rp.Session(), str, ctrl.businessName, now+5*60)
	return &api_util.GetCaptchaResponse{CaptchaData: data, Ticket: ticket}, nil
}
