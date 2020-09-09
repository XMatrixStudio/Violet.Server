package result

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type Resp struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func OnDo(c *gin.Context, err error) {
	OnFetch(c, nil, err)
}

func OnFetch(c *gin.Context, data interface{}, err error) {
	if err != nil {
		if httpErr, ok := err.(*Error); ok {
			c.PureJSON(http.StatusOK, Resp{Code: httpErr.ErrCode, Msg: httpErr.ErrMsg})
		} else {
			logs.CtxError(c, "fetch unknown error", zap.Error(err))
			c.PureJSON(http.StatusOK, Resp{Code: CodeInternalServerError, Msg: "unknown_error"})
		}
	} else {
		c.PureJSON(http.StatusOK, Resp{Code: CodeOk, Msg: "success", Data: data})
	}
}
