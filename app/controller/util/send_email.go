package util

import "context"

type SendEmailController struct {
	ctx     context.Context
	email   string
	captcha string
	ticket  string
}

func NewSendEmailController(ctx context.Context, email, captcha, ticket string) *SendEmailController {
	return &SendEmailController{
		ctx:     ctx,
		email:   email,
		captcha: captcha,
		ticket:  ticket,
	}
}

func (ctrl *SendEmailController) Do() error {
	return nil
}
