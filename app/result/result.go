package result

type Resp struct {
	Code       int         `json:"code"`
	Msg        string      `json:"msg"`
	Data       interface{} `json:"data"`
}

func OnSuccess(data ...interface{}) *Resp {
	if len(data) == 0 {
		return &Resp{Code: CodeOk, Msg: "success"}
	} else {
		return &Resp{Code: CodeOk, Msg: "success", Data: data[0]}
	}
}

func OnError(code int, msg string) *Resp {
	return &Resp{Code: code, Msg: msg}
}
