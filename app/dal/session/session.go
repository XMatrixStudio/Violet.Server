package session

import (
	"context"
	"fmt"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

var (
	redisStore redis.Store
)

func InitSessions(ctx context.Context, cfg config.Config) {
	var err error
	redisStore, err = redis.NewStore(10, "tcp", fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		cfg.Redis.Password, []byte(cfg.Redis.SessionSecret))
	if err != nil {
		logs.Fatal(ctx, "call redis.NewStore fail", zap.Error(err))
	}
}

func WithSessions() gin.HandlerFunc {
	return sessions.Sessions("violet", redisStore)
}

func getInt64(session sessions.Session, key interface{}, defaultValue int64) int64 {
	if iVal := session.Get(key); iVal == nil {
		return defaultValue
	} else if val, ok := iVal.(int64); ok {
		return val
	}
	return defaultValue
}

func getString(session sessions.Session, key interface{}, defaultValue string) string {
	if iVal := session.Get(key); iVal == nil {
		return defaultValue
	} else if val, ok := iVal.(string); ok {
		return val
	}
	return defaultValue
}