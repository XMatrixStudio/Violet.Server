package controller

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/module/captcha"
	"github.com/xmatrixstudio/violet.server/app/result"
	"github.com/xmatrixstudio/violet.server/lib/uslice"
)

type UtilController struct {
	BaseController
	CaptchaService *captcha.Service `inject:""`
}

func (c *UtilController) GetCaptcha(ctx *gin.Context) *result.Resp {
	key := ctx.Query("key")
	if !uslice.StringIn(key, []string{"register"}) {
		return result.OnError(10000, "invalid_key")
	}
	data := c.CaptchaService.GetCaptcha(ctx, key, 5*time.Minute)
	return result.OnSuccess(fmt.Sprintf("data:image/png;base64,%s", data))
}
