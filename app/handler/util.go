package handler

import (
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_util"
	vd "github.com/xmatrixstudio/violet.server/lib/validates"
	"go.uber.org/zap"
)

var getCaptchaBusinessNameList = []string{"register"}

// GetCaptcha 获取图形验证码
func GetCaptcha(r *api.RequestContext) api.Result {
	query := api_util.GetCaptchaQuery{}
	if err := r.Ctx().ShouldBindQuery(&query); err != nil {
		return r.OnError(api.ErrBadRequest)
	}
	err := vd.Assert(
		vd.I{V: vd.NewStringValidator(query.BusinessName).MustIn(getCaptchaBusinessNameList), E: api.ErrInvalidBusinessName},
	)
	if err != nil {
		return r.OnError(err)
	}

	r.Logger().Info("call GetCaptcha", zap.String("business_name", query.BusinessName))
	return r.OnFetch(nil, nil)
}
