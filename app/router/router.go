package router

import (
	"fmt"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
	"github.com/xmatrixstudio/violet.server/app/result"
)

func New(c *config.Config) *gin.Engine {
	// 初始化组件
	result.InitEnv(c.App.Env)
	if c.App.Env == config.AppConfigEnvProduct {
		gin.SetMode(gin.ReleaseMode)
	}

	// 构建Router
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	store, _ := redis.NewStore(10, "tcp", fmt.Sprintf("%s:%s", c.Redis.Host, c.Redis.Port), c.Redis.Password, []byte("secret"))
	r.Use(sessions.Sessions("violet", store))

	// 绑定Handler
	injector := config.NewInject()
	BindUser(r.Group("/i/user"), injector)
	BindUtil(r.Group("/i/util"), injector)

	return r
}
