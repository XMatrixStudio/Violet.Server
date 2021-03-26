package api

import "go.uber.org/zap"

type Result *_Result

type _Result struct {
	Code int32       `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func newResult(r *RequestContext, data interface{}, err error) Result {
	var httpErr *Error
	if err != nil {
		if e, ok := err.(*Error); ok {
			r.Logger().Info("return error", zap.Int32("code", e.code), zap.String("msg", e.msg))
			httpErr = e
		} else {
			r.Logger().Error("return unknown error", zap.Error(err))
			httpErr = Unknown
		}
		return &_Result{Code: httpErr.code, Msg: httpErr.msg}
	}
	return &_Result{Code: 0, Msg: "success", Data: data}
}
