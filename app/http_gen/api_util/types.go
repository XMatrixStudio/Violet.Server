package api_util

type GetCaptchaQuery struct {
	BusinessName string `param:"business_name"`
}

type GetCaptchaResponse struct {
	CaptchaData string `json:"captcha_data"`
	Ticket      string `json:"ticket"`
}
