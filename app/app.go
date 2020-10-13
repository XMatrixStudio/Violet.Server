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
	"github.com/xmatrixstudio/violet.server/app/service/sender"
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
	sender.InitSender()
	if c.App.Env == config.AppConfigEnvProduct {
		gin.SetMode(gin.ReleaseMode)
	}

	// 构建Session存储
	store, err := redis.NewStore(10, "tcp", fmt.Sprintf("%s:%s", c.Redis.Host, c.Redis.Port),
		c.Redis.Password, []byte(c.Redis.SessionSecret))
	if err != nil {
		logs.Fatal("call redis.NewStore fail", zap.Error(err))
	}

	// 构建Router
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(sessions.Sessions("violet", store))
	r.Use(logs.WithTraceID())

	// 绑定Handler
	BindRouters(r, Routers)

	logs.Info("new violet app success")

	return r
}

func Wrap(fn RouterFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.PureJSON(http.StatusOK, fn(c))
	}
}
