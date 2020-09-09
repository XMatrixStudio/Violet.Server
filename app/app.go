package app

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
	utilHandler "github.com/xmatrixstudio/violet.server/app/handler/util"
	"github.com/xmatrixstudio/violet.server/app/service/generator"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type Router struct {
	RouterFunc gin.HandlerFunc
	MethodName string
}

var Routers = map[string]Router{
	"/i/util/captcha": {RouterFunc: utilHandler.GetCaptcha, MethodName: http.MethodGet},
}

func BindRouters(r *gin.Engine, routers map[string]Router) {
	for url, router := range routers {
		r.Handle(router.MethodName, url, router.RouterFunc)
	}
}

func New(c *config.Config) *gin.Engine {
	// 初始化组件
	logs.InitLogger(c.App.Env == config.AppConfigEnvProduct)
	generator.InitGenerator()
	if c.App.Env == config.AppConfigEnvProduct {
		gin.SetMode(gin.ReleaseMode)
	}

	// 构建Router
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	store, err := redis.NewStore(10, "tcp", fmt.Sprintf("%s:%s", c.Redis.Host, c.Redis.Port), c.Redis.Password, []byte("secret"))
	if err != nil {
		logs.Fatal("call redis.NewStore fail", zap.Error(err))
	}
	r.Use(sessions.Sessions("violet", store))

	// 绑定Handler
	BindRouters(r, Routers)

	return r
}
