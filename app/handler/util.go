package handler

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/controller/util"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_util"
	vd "github.com/xmatrixstudio/violet.server/lib/validates"
	"go.uber.org/zap"
)

const (
	lenCaptcha = 4
	lenTicket  = 32
)

// GetCaptcha 获取图形验证码
func GetCaptcha(r *api.RequestContext) api.Result {
	query := api_util.GetCaptchaQuery{}
	if err := r.ShouldBindQuery(&query); err != nil {
		return r.OnError(api.ErrBadRequest)
	}
	err := vd.Assert(
		vd.I{V: vd.NewStringValidator(query.BusinessName).MustIn([]string{"register"}), E: api.ErrInvalidBusinessName},
	)
	if err != nil {
		return r.OnError(err)
	}

	r.Logger().Info("API GetCaptcha", zap.String("business_name", query.BusinessName))
	return r.OnFetch(util.NewGetCaptchaController(r, query).Fetch())
}

// SendEmail 发送邮件
func SendEmail(r *api.RequestContext) api.Result {
	req := api_util.SendEmailRequest{}
	if err := r.ShouldBindJSON(&req); err != nil {
		return r.OnError(api.ErrBadRequest)
	}
	err := vd.Assert(
		vd.I{V: vd.NewStringValidator(req.BusinessName).MustIn([]string{"register"}), E: api.ErrInvalidBusinessName},
		vd.I{V: vd.NewStringValidator(req.Email).MustEmail(), E: api.ErrInvalidEmail},
		vd.I{V: vd.NewStringValidator(req.Captcha).MustLen(lenCaptcha, lenCaptcha), E: api.ErrInvalidCaptcha},
		vd.I{V: vd.NewStringValidator(req.Ticket).MustHex().MustLen(lenTicket, lenTicket), E: api.ErrInvalidTicket},
	)
	if err != nil {
		return r.OnError(err)
	}

	r.Logger().Info("API SendEmail", zap.String("email", req.Email), zap.String("business_name", req.BusinessName))
	return r.OnFetch(util.NewSendEmailController(r, req).Fetch())
}
