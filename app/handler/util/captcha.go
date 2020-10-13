package util

import (
	"github.com/gin-gonic/gin"
	utilCtrl "github.com/xmatrixstudio/violet.server/app/controller/util"
	r "github.com/xmatrixstudio/violet.server/app/result"
	v "github.com/xmatrixstudio/violet.server/lib/validates"
)

var getCaptchaBusinessList = []string{"register"}

func GetCaptcha(c *gin.Context) r.Resp {
	businessName := c.Query("business_name")
	if err := validateGetCaptchaRequest(businessName); err != nil {
		return r.OnError(c, err)
	}
	ctrl := utilCtrl.NewGetCaptchaController(c, businessName)
	resp, err := ctrl.Fetch()
	return r.OnFetch(c, resp, err)
}

func validateGetCaptchaRequest(businessName string) error {
	businessNameValidator := v.NewStringValidator(businessName, v.Nothing).WithEnums(getCaptchaBusinessList)
	return r.Assert(
		r.AssertItem{Validator: businessNameValidator, Err: r.ErrInvalidBusinessName},
	)
}
