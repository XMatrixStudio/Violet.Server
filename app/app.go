package app

import (
	"context"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
	"github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/dal/store"
	"github.com/xmatrixstudio/violet.server/app/handler"
	"github.com/xmatrixstudio/violet.server/app/result"
	"github.com/xmatrixstudio/violet.server/lib/logs"
)

type Router struct {
	URL    string
	Func   RouterFunc
	Method string
}

type RouterFunc func(ctx *result.RequestParam) result.Result

var Routers = []Router{
	{URL: "/i/users", Func: handler.Register, Method: http.MethodPost},
	// {URL: "/i/utils/captcha", Func: utilHandler.GetCaptcha, Method: http.MethodGet},
	// {URL: "/i/utils/email", Func: utilHandler.PostEmail, Method: http.MethodPost},
	// {URL: "/i/utils/email", Func: utilHandler.PutEmail, Method: http.MethodPut},
}

func NewEngine(cfg config.Config) *gin.Engine {
	// 初始化组件
	rand.Seed(time.Now().UnixNano())
	ctx := context.Background()
	logs.InitLogger(cfg.App.LogPath, cfg.App.Env == config.AppConfigEnvProduct)
	session.InitSessions(ctx, cfg)
	store.InitStores(ctx, cfg)

	if cfg.App.Env == config.AppConfigEnvProduct {
		gin.SetMode(gin.ReleaseMode)
	}

	// 构建Router
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	r.Use(logs.WithTraceID())
	r.Use(session.WithSessions())

	for _, router := range Routers {
		r.Handle(router.Method, router.URL, Wrap(router.Func))
	}

	logs.Info(ctx, "new violet app success")

	return r
}

func Wrap(fn RouterFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		rp := result.NewRequestParam(c)
		defer result.RecycleRequestParam(rp)
		c.PureJSON(http.StatusOK, fn(rp))
	}
}
