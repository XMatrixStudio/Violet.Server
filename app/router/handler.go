package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/result"
)

type HandlerFunc func(ctx *gin.Context) *result.Resp

func Wrap(fn HandlerFunc) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		resp := fn(ctx)
		ctx.JSON(http.StatusOK, resp)
	}
}
