package logs

import (
	"context"

	"go.uber.org/zap"
)

func StartFail(msg string) {
	panic("[StartFail] " + msg)
}

func Info(msg string, fields ...zap.Field) {
	defaultLogger.Info(msg, fields...)
}

func Fatal(msg string, fields ...zap.Field) {
	defaultLogger.Fatal(msg, fields...)
}

func CtxError(ctx context.Context, msg string, field ...zap.Field) {
	field = append(field, getContextField(ctx)...)
	defaultLogger.Error(msg, field...)
}

func getContextField(ctx context.Context) []zap.Field {
	ctxFields := make([]zap.Field, 0, 1)
	ctxFields = append(ctxFields, zap.String("traceID", getTraceID(ctx)))
	return ctxFields
}
