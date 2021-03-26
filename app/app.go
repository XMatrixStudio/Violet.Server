package app

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/config"
	"github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/dal/store"
	"github.com/xmatrixstudio/violet.server/app/handler"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type Router struct {
	URL    string
	Func   RouterFunc
	Method string
}

type RouterFunc func(ctx *api.RequestContext) api.Result

var Routers = []Router{
	{URL: "/i/users", Func: handler.Register, Method: http.MethodPost},
	{URL: "/i/utils/captcha", Func: handler.GetCaptcha, Method: http.MethodGet},
	// {URL: "/i/utils/email", Func: utilHandler.PostEmail, Method: http.MethodPost},
	// {URL: "/i/utils/email", Func: utilHandler.PutEmail, Method: http.MethodPut},
}

func NewEngine(cfg config.Config) *gin.Engine {
	// 初始化组件
	rand.Seed(time.Now().UnixNano())
	logs.InitLogger(cfg.App.LogPath, cfg.App.Env == config.AppConfigEnvProduct)
	session.InitSessions(cfg)
	store.InitStores(cfg)

	if cfg.App.Env == config.AppConfigEnvProduct {
		gin.SetMode(gin.ReleaseMode)
	}

	// 构建Router
	r := gin.New()
	r.Use(
		api.MWTraceID(), // TraceID中间件需要在最开头
		api.MWLogger(cfg),
		api.MWRecovery(cfg),
		session.MWSessions(),
	)

	for _, router := range Routers {
		r.Handle(router.Method, router.URL, Wrap(router.Func))
	}

	zap.L().Info("new Violet app engine success")

	return r
}

func Wrap(fn RouterFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		r := api.NewRequestContext(c)
		defer api.RecycleRequestParam(r)
		c.PureJSON(http.StatusOK, fn(r))
	}
}
