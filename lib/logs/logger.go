package logs

import (
	"sync"

	"go.uber.org/zap"
)

var (
	defaultLogger *zap.Logger
	once          sync.Once
)

func InitLogger(isProduct bool) {
	once.Do(func() {
		defaultLogger, _ = zap.NewDevelopment()
		defaultLogger = defaultLogger.WithOptions(zap.AddCallerSkip(1))
	})
}

func Sync() {
	_ = defaultLogger.Sync()
}
