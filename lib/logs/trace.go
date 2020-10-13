package logs

import (
	"context"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	HeaderTraceID = "X-Trace-ID"
	KeyTraceID    = "traceID"

	defaultTraceID = "0000"
)

func WithTraceID() gin.HandlerFunc {
	return func(c *gin.Context) {
		traceID := c.GetHeader(HeaderTraceID)
		if traceID == "" {
			traceID = genTraceID()
		}
		c.Header(HeaderTraceID, traceID)
		c.Set(KeyTraceID, traceID)
		c.Next()
	}
}

func genTraceID() string {
	return strconv.FormatInt(time.Now().UnixNano(), 10)
}

func getTraceID(ctx context.Context) string {
	if val, ok := ctx.Value(KeyTraceID).(string); ok && val != "" {
		return val
	}
	return defaultTraceID
}
