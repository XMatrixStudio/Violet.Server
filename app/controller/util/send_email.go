package util

import (
	"github.com/xmatrixstudio/violet.server/app/result"
)

type SendEmailController struct {
	rp      *result.RequestContext
	email   string
	captcha string
	ticket  string
}

func NewSendEmailController(rp *result.RequestContext, email, captcha, ticket string) *SendEmailController {
	return &SendEmailController{
		rp:      rp,
		email:   email,
		captcha: captcha,
		ticket:  ticket,
	}
}

func (ctrl *SendEmailController) Do() error {
	return nil
}
