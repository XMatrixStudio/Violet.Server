package result

import (
	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/lib/logs"
	"go.uber.org/zap"
)

type Resp *_Resp

type _Resp struct {
	Code int32       `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func OnDo(c *gin.Context, err error) Resp {
	return OnFetch(c, nil, err)
}

func OnError(c *gin.Context, err error) Resp {
	return OnFetch(c, nil, err)
}

func OnFetch(c *gin.Context, data interface{}, err error) Resp {
	if err != nil {
		if httpErr, ok := err.(*Error); ok {
			return &_Resp{Code: httpErr.ErrCode, Msg: httpErr.ErrMsg}
		} else {
			logs.CtxError(c, "fetch unknown error", zap.Error(err))
			return &_Resp{Code: CodeInternalServerError, Msg: "unknown_error"}
		}
	}
	return &_Resp{Code: CodeOk, Msg: "success", Data: data}
}
