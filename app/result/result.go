package result

import "github.com/xmatrixstudio/violet.server/app/config"

var resultEnv string

type Resp struct {
	Code  int         `json:"code"`
	Msg   string      `json:"msg"`
	Data  interface{} `json:"data,omitempty"`
	Debug string      `json:"debug,omitempty"`
}

func InitEnv(env string) {
	resultEnv = env
}

func OnSuccess(data ...interface{}) *Resp {
	if len(data) == 0 {
		return &Resp{Code: CodeOk, Msg: "success"}
	}
	return &Resp{Code: CodeOk, Msg: "success", Data: data[0]}
}

func OnFail(code int, msg string) *Resp {
	return &Resp{Code: code, Msg: msg}
}

func OnError(code int, msg string, err error) *Resp {
	if resultEnv == config.AppConfigEnvDev {
		return &Resp{Code: code, Msg: msg, Debug: err.Error()}
	}
	return &Resp{Code: code, Msg: msg}
}
