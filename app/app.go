package app

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
	utilHandler "github.com/xmatrixstudio/violet.server/app/handler/util"
	"github.com/xmatrixstudio/violet.server/app/result"
	"github.com/xmatrixstudio/violet.server/app/service/generator"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type Router struct {
	URL    string
	Func   RouterFunc
	Method string
}

type RouterFunc func(*gin.Context) result.Resp

var Routers = []Router{
	{URL: "/i/utils/captcha", Func: utilHandler.GetCaptcha, Method: http.MethodGet},
	{URL: "/i/utils/email", Func: utilHandler.PostEmail, Method: http.MethodPost},
	{URL: "/i/utils/email", Func: utilHandler.PutEmail, Method: http.MethodPut},
}

func BindRouters(r *gin.Engine, routers []Router) {
	for _, router := range routers {
		r.Handle(router.Method, router.URL, Wrap(router.Func))
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

func Wrap(fn RouterFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.PureJSON(http.StatusOK, fn(c))
	}
}
