package session

import (
	"fmt"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/configs"
	"go.uber.org/zap"
)

var (
	redisStore redis.Store
)

func InitSessions(cfg configs.Config) {
	var err error
	redisStore, err = redis.NewStore(10, "tcp", fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		cfg.Redis.Password, []byte(cfg.Redis.SessionSecret))
	if err != nil {
		zap.L().Fatal("Call redis.NewStore fail", zap.Error(err))
	}
}

func MWSessions() gin.HandlerFunc {
	return sessions.Sessions("violet", redisStore)
}

func getStringFromSession(session sessions.Session, key interface{}, defaultValue string) string {
	if iVal := session.Get(key); iVal == nil {
		return defaultValue
	} else if val, ok := iVal.(string); ok {
		return val
	}
	return defaultValue
}
