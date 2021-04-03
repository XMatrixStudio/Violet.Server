package runtimes

import (
	"reflect"
	"runtime"
	"strings"
)

func GetFuncFullName(fn interface{}) string {
	return runtime.FuncForPC(reflect.ValueOf(fn).Pointer()).Name()
}

func GetFuncShortName(fn interface{}) string {
	fnName := GetFuncFullName(fn)
	idx := strings.LastIndexByte(fnName, '.')
	if idx == -1 {
		return fnName
	}
	return fnName[idx+1:]
}
