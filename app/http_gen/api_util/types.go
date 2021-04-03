package api_util

type GetCaptchaQuery struct {
	BusinessName string `form:"business_name"`
}

type GetCaptchaResponse struct {
	CaptchaData string `json:"captcha_data"`
	Ticket      string `json:"ticket"`
}

type SendEmailRequest struct {
	BusinessName string `json:"business_name"`
	Email        string `json:"email"`
	Captcha      string `json:"captcha"`
	Ticket       string `json:"ticket"`
}

type SendEmailResponse struct {
	Ticket string `json:"ticket"`
}
