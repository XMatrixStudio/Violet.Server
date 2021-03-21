package util

import (
	utilCtrl "github.com/xmatrixstudio/violet.server/app/controller/util"
	r "github.com/xmatrixstudio/violet.server/app/result"
	v "github.com/xmatrixstudio/violet.server/lib/validates"
)

var getCaptchaBusinessList = []string{"register"}

func GetCaptcha(rp *r.RequestParam) r.Resp {
	businessName := rp.GinCtx().Query("business_name")
	if err := validateGetCaptchaRequest(businessName); err != nil {
		return r.OnError(rp, err)
	}
	ctrl := utilCtrl.NewGetCaptchaController(rp, businessName)
	resp, err := ctrl.Fetch()
	return r.OnFetch(rp, resp, err)
}

func validateGetCaptchaRequest(businessName string) error {
	businessNameValidator := v.NewStringValidator(businessName, v.Nothing).WithEnums(getCaptchaBusinessList)
	return r.Assert(
		r.AssertItem{Validator: businessNameValidator, Err: r.ErrInvalidBusinessName},
	)
}
