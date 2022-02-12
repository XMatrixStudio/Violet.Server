package api

import (
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"runtime/debug"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/configs"
	"go.uber.org/zap"
)

const (
	headerTraceID = "X-Trace-ID"
	keyHandler    = "handler"
	keyLogger     = "logger"
	keyTraceID    = "traceID"
)

func MWLogger(cfg configs.Config) gin.HandlerFunc {
	if cfg.App.Env != configs.AppConfigEnvProduct {
		return gin.Logger()
	}

	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		end := time.Now()
		latency := end.Sub(start)

		logger, ok := c.Value(keyLogger).(*zap.Logger)
		if ok && logger != nil {
			if len(c.Errors) > 0 {
				for _, e := range c.Errors.Errors() {
					logger.Error(e)
				}
			} else {
				logger.Info(path,
					zap.Duration("latency", latency),
					zap.Int("status", c.Writer.Status()),
					zap.String("ip", c.ClientIP()),
					zap.String("method", c.Request.Method),
					zap.String("query", query),
					zap.String("userAgent", c.Request.UserAgent()),
				)
			}
		}
	}
}

func MWRecovery(cfg configs.Config) gin.HandlerFunc {
	if cfg.App.Env != configs.AppConfigEnvProduct {
		return gin.Recovery()
	}

	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger, ok := c.Value(keyLogger).(*zap.Logger)
				if !ok || logger == nil {
					_, _ = fmt.Fprintf(os.Stderr, "panic: %v\n%s", err, string(debug.Stack()))
					return
				}

				// Check for a broken connection, as it is not really a
				// condition that warrants a panic stack trace.
				var brokenPipe bool
				if ne, ok := err.(*net.OpError); ok {
					if se, ok := ne.Err.(*os.SyscallError); ok {
						if strings.Contains(strings.ToLower(se.Error()), "broken pipe") || strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
							brokenPipe = true
						}
					}
				}

				httpRequest, _ := httputil.DumpRequest(c.Request, false)
				if brokenPipe {
					logger.Error(c.Request.URL.Path,
						zap.Any("error", err),
						zap.String("request", string(httpRequest)),
					)
					_ = c.Error(err.(error))
					c.Abort()
					return
				}

				logger.Error("[Recovery from panic]",
					zap.Any("error", err),
					zap.String("request", string(httpRequest)),
					zap.String("stack", string(debug.Stack())),
				)
				c.AbortWithStatus(http.StatusInternalServerError)
			}
		}()
		c.Next()
	}
}

func MWTraceID() gin.HandlerFunc {
	return func(c *gin.Context) {
		traceID := c.GetHeader(headerTraceID)
		if traceID == "" {
			traceID = genTraceID()
		}
		logger := zap.L()
		if traceID != "" {
			c.Header(headerTraceID, traceID)
			logger = logger.With(zap.String(keyTraceID, traceID))
		}
		c.Set(keyLogger, logger)
		c.Next()
	}
}

func genTraceID() string {
	return strconv.FormatInt(time.Now().UnixNano(), 10)
}
