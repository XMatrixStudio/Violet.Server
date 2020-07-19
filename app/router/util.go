package router

import (
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/controller"
	"github.com/xmatrixstudio/violet.server/lib/inject"
)

func BindUtil(r *gin.RouterGroup, injector *inject.Injector) {
	utilController := injector.Inject(new(controller.UtilController)).(*controller.UtilController)
	r.GET("/captcha", Wrap(utilController.GetCaptcha))
}
