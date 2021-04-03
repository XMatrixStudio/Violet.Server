package app

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/config"
	"github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/dal/store"
	"github.com/xmatrixstudio/violet.server/app/handler"
	"github.com/xmatrixstudio/violet.server/app/service/generator"
	"github.com/xmatrixstudio/violet.server/app/service/sender"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"github.com/xmatrixstudio/violet.server/lib/runtimes"
	"go.uber.org/zap"
)

type Router struct {
	URL    string
	Method string
	Func   RouterFunc
}

type RouterFunc func(ctx *api.RequestContext) api.Result

var Routers = []Router{
	{URL: "/i/users", Method: http.MethodPost, Func: handler.Register},
	{URL: "/i/users/session", Method: http.MethodPost, Func: handler.Login},
	{URL: "/i/utils/captcha", Method: http.MethodGet, Func: handler.GetCaptcha},
	{URL: "/i/utils/email", Method: http.MethodPost, Func: handler.SendEmail},
	// {URL: "/i/utils/email", Func: utilHandler.PutEmail, Method: http.MethodPut},
}

// NewEngine 构造Violet的Gin实例
func NewEngine(cfg config.Config) *gin.Engine {
	// 初始化组件
	rand.Seed(time.Now().UnixNano())
	logs.InitLogger(cfg.App.LogPath, cfg.App.Env == config.AppConfigEnvProduct)

	generator.InitGenerator()
	sender.InitSender(cfg)
	session.InitSessions(cfg)
	store.InitStores(cfg)

	if cfg.App.Env == config.AppConfigEnvProduct {
		gin.SetMode(gin.ReleaseMode)
	}

	// 校验Router合法性
	routerMap := make(map[string]struct{}, len(Routers))
	for _, router := range Routers {
		key := fmt.Sprintf("%s:%s:%s", router.URL, router.Method, runtimes.GetFuncFullName(router.Func))
		if _, ok := routerMap[key]; ok {
			zap.L().Fatal("Check router fail, exist duplicated router", zap.String("routerInfo", key))
		} else {
			routerMap[key] = struct{}{}
		}
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

	zap.L().Info("New Violet app engine success")

	return r
}

func Wrap(fn RouterFunc) gin.HandlerFunc {
	handlerName := runtimes.GetFuncShortName(fn)
	return func(c *gin.Context) {
		r := api.NewRequestContext(c, handlerName)
		defer api.RecycleRequestParam(r)
		rst := fn(r)
		if rst != nil {
			c.PureJSON(http.StatusOK, rst)
		} else {
			c.String(http.StatusNotImplemented, "Not Implemented")
		}
	}
}
