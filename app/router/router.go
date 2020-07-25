package router

import (
	"fmt"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
)

func New(filename string) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	injector := config.NewInject()
	c := config.NewConfig(filename)

	store, _ := redis.NewStore(10, "tcp", fmt.Sprintf("%s:%s", c.Redis.Host, c.Redis.Port), c.Redis.Password, []byte("secret"))
	r.Use(sessions.Sessions("violet", store))
	BindUtil(r.Group("/i/util"), injector)

	return r
}
