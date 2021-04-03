package util

import (
	"time"

	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_util"
	"github.com/xmatrixstudio/violet.server/app/service/generator"
	"go.uber.org/zap"
)

type GetCaptchaController struct {
	r     *api.RequestContext
	query api_util.GetCaptchaQuery
}

func NewGetCaptchaController(r *api.RequestContext, query api_util.GetCaptchaQuery) *GetCaptchaController {
	return &GetCaptchaController{
		r:     r,
		query: query,
	}
}

func (ctrl *GetCaptchaController) Fetch() (*api_util.GetCaptchaResponse, error) {
	base64Value, strValue, err := generator.CaptchaGenerator.GenBase64Captcha()
	if err != nil {
		ctrl.r.Logger().Error("GenBase64Captcha fail", zap.Error(err))
		return nil, err
	}
	expire := ctrl.r.Now().Add(5 * time.Minute).Unix()
	ctrl.r.Logger().Debug("GenBase64Captcha", zap.Strings("a", []string{base64Value, strValue}))

	ticket, err := session.SetCaptcha(ctrl.r, strValue, ctrl.query.BusinessName, expire)
	if err != nil {
		ctrl.r.Logger().Error("SetCaptcha fail", zap.Error(err))
		return nil, err
	}
	return &api_util.GetCaptchaResponse{CaptchaData: base64Value, Ticket: ticket}, nil
}
