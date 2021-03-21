package logs

import (
	"context"

	"go.uber.org/zap"
)

func Debug(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, getContextField(ctx)...)
	defaultLogger.Debug(msg, fields...)
}

func Info(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, getContextField(ctx)...)
	defaultLogger.Info(msg, fields...)
}

func Warn(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, getContextField(ctx)...)
	defaultLogger.Warn(msg, fields...)
}

func Error(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, getContextField(ctx)...)
	defaultLogger.Error(msg, fields...)
}

func Fatal(ctx context.Context, msg string, fields ...zap.Field) {
	fields = append(fields, getContextField(ctx)...)
	defaultLogger.Fatal(msg, fields...)
}

func getContextField(ctx context.Context) []zap.Field {
	ctxFields := make([]zap.Field, 0, 1)
	if traceID := getTraceID(ctx); traceID != "" {
		ctxFields = append(ctxFields, zap.String(KeyTraceID, traceID))
	}
	return ctxFields
}
