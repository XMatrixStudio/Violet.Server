package util

import (
	"github.com/gin-gonic/gin"
	utilCtrl "github.com/xmatrixstudio/violet.server/app/controller/util"
	r "github.com/xmatrixstudio/violet.server/app/result"
	v "github.com/xmatrixstudio/violet.server/lib/validates"
)

const (
	emailPattern = `^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$`
)

type PostEmailRequest struct {
	Captcha string `json:"captcha"`
	Email   string `json:"email"`
	Ticket  string `json:"ticket"`
}

func PostEmail(c *gin.Context) r.Resp {
	req := PostEmailRequest{}
	if err := c.BindJSON(&req); err != nil {
		return r.OnError(c, r.ErrBadRequest)
	} else if err = validatePostEmailRequest(&req); err != nil {
		return r.OnError(c, err)
	}
	ctrl := utilCtrl.NewSendEmailController(c, req.Email, req.Captcha, req.Ticket)
	return r.OnDo(c, ctrl.Do())
}

func PutEmail(c *gin.Context) r.Resp {
	return nil
}

func validatePostEmailRequest(req *PostEmailRequest) error {
	return r.Assert(
		r.AssertItem{Validator: v.NewStringValidator(req.Captcha, v.NotZeroValue), Err: r.ErrInvalidCaptcha},
		r.AssertItem{Validator: v.NewStringValidator(req.Email, v.NotZeroValue).WithPattern(emailPattern), Err: r.ErrInvalidEmail},
		r.AssertItem{Validator: v.NewStringValidator(req.Ticket, v.NotZeroValue), Err: r.ErrInvalidTicket},
	)
}
