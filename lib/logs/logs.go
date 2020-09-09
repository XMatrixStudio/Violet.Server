package logs

import (
	"context"

	"go.uber.org/zap"
)

func Fatal(msg string, fields ...zap.Field) {
	defaultLogger.Fatal(msg, fields...)
}

func CtxError(ctx context.Context, msg string, field ...zap.Field) {
	defaultLogger.Error(msg, field...)
}
