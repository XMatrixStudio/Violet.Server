package router

import (
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/controller"
	"github.com/xmatrixstudio/violet.server/lib/inject"
)

func BindUser(r *gin.RouterGroup, injector *inject.Injector) {
	userController := injector.Inject(new(controller.UserController)).(*controller.UserController)
	r.POST("/email", Wrap(userController.PostEmail))
}
