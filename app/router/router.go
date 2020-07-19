package router

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
)

func New() *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("violet", store))

	injector := config.NewInject()
	BindUtil(r.Group("/i/util"), injector)

	return r
}
