package util

import (
	"github.com/gin-gonic/gin"
	utilCtrl "github.com/xmatrixstudio/violet.server/app/controller/util"
	"github.com/xmatrixstudio/violet.server/app/result"
	"github.com/xmatrixstudio/violet.server/lib/uslice"
)

var getCaptchaBusinessList = []string{"register"}

func GetCaptcha(c *gin.Context) {
	businessName := c.Query("business_name")
	uslice.StringIn(businessName, getCaptchaBusinessList)
	ctrl := utilCtrl.NewGetCaptchaController(c, businessName)
	resp, err := ctrl.Fetch()
	result.OnFetch(c, resp, err)
}
