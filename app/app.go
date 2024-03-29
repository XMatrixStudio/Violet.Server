package app

import (
	"math/rand"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/configs"
	"github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/dal/stores"
	"github.com/xmatrixstudio/violet.server/app/http_gen/userapi"
	"github.com/xmatrixstudio/violet.server/app/routers"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

// NewEngine 构造 Violet 的 gin 实例
func NewEngine(cfg configs.Config) *gin.Engine {
	// 初始化组件
	rand.Seed(time.Now().UnixNano())
	logs.InitLogger(cfg.App.LogPath, cfg.App.Env == configs.AppConfigEnvProduct)

	session.InitSessions(cfg)
	stores.InitStores(cfg)

	if cfg.App.Env == configs.AppConfigEnvProduct {
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
	userapi.RegisterUserRouter(r, routers.NewUserRouter())

	zap.L().Info("New Violet app engine success")

	return r
}
