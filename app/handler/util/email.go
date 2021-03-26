package util

import (
	utilCtrl "github.com/xmatrixstudio/violet.server/app/controller/util"
	"github.com/xmatrixstudio/violet.server/app/http_gen/util"
	r "github.com/xmatrixstudio/violet.server/app/result"
	v "github.com/xmatrixstudio/violet.server/lib/validates"
)

const (
	emailPattern = `^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$`
)

func PostEmail(rp *r.RequestContext) r.Resp {
	req := api_util.PostEmailRequest{}
	if err := rp.GinCtx().BindJSON(&req); err != nil {
		return r.OnError(rp, r.ErrBadRequest)
	} else if err = validatePostEmailRequest(&req); err != nil {
		return r.OnError(rp, err)
	}
	ctrl := utilCtrl.NewSendEmailController(rp, req.Email, req.Captcha, req.Ticket)
	return r.OnDo(rp, ctrl.Do())
}

func PutEmail(rp *r.RequestContext) r.Resp {
	return nil
}

func validatePostEmailRequest(req *api_util.PostEmailRequest) error {
	return r.Assert(
		r.AssertItem{Validator: v.NewStringValidator(req.Captcha, v.NotZeroValue), Err: r.ErrInvalidCaptcha},
		r.AssertItem{Validator: v.NewStringValidator(req.Email, v.NotZeroValue).WithPattern(emailPattern), Err: r.ErrInvalidEmail},
		r.AssertItem{Validator: v.NewStringValidator(req.Ticket, v.NotZeroValue), Err: r.ErrInvalidTicket},
	)
}
