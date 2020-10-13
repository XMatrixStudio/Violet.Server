package util

type GetCaptchaResponse struct {
	CaptchaData string `json:"captcha_data"`
	Ticket      string `json:"ticket"`
}

type PostEmailRequest struct {
	Captcha string `json:"captcha"`
	Email   string `json:"email"`
	Ticket  string `json:"ticket"`
}
