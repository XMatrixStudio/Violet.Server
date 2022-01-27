package api

import (
	"go.uber.org/zap"
)

type Result struct {
	Code    int32       `json:"code"`
	Message string      `json:"message"`
	Display string      `json:"display"`
	Data    interface{} `json:"data,omitempty"`
}

func NewResult(r *RequestContext, data interface{}, err error) *Result {
	var httpErr *Error
	if err != nil {
		if e, ok := err.(*Error); ok {
			r.Logger().Info("return error", zap.Int32("code", e.code), zap.String("message", e.msg))
			httpErr = e
		} else {
			r.Logger().Error("return unknown error", zap.Error(err))
			httpErr = Unknown
		}
	} else {
		httpErr = Success
	}

	res := &Result{
		Code:    httpErr.code,
		Message: httpErr.msg,
		Display: "", // TODO
		Data:    data,
	}
	return res
}
