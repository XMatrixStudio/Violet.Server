package result

import (
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type Result *_Result

type _Result struct {
	Code int32       `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func OnDo(c *gin.Context, err error) Result {
	return OnFetch(c, nil, err)
}

func OnError(c *gin.Context, err error) Result {
	return OnFetch(c, nil, err)
}

func OnFetch(c *gin.Context, data interface{}, err error) Result {
	var httpErr *Error
	if err != nil {
		if e, ok := err.(*Error); ok {
			httpErr = e
		} else {
			logs.Error(c, "fetch unknown error", zap.Error(err))
			httpErr = Unknown
		}
		return &_Result{Code: httpErr.code, Msg: httpErr.msg}
	}
	return &_Result{Code: 0, Msg: "success", Data: data}
}
