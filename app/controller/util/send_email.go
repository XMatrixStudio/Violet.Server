package util

import (
	"fmt"
	"strings"
	"time"

	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/dal/session"
	"github.com/xmatrixstudio/violet.server/app/http_gen/api_util"
	"github.com/xmatrixstudio/violet.server/app/service/sender"
	"github.com/xmatrixstudio/violet.server/lib/cryptos"
)

type SendEmailController struct {
	r   *api.RequestContext
	req api_util.SendEmailRequest
}

func NewSendEmailController(r *api.RequestContext, req api_util.SendEmailRequest) *SendEmailController {
	return &SendEmailController{
		r:   r,
		req: req,
	}
}

func (ctrl *SendEmailController) Fetch() (*api_util.SendEmailResponse, error) {
	// 校验是否可以发送邮件
	if err := session.CheckCanSendEmail(ctrl.r, ctrl.req.Email); err != nil {
		return nil, err
	}
	// 校验图形验证码是否合法
	if err := session.CheckCaptcha(ctrl.r, ctrl.req.BusinessName, ctrl.req.Captcha, ctrl.req.Ticket); err != nil {
		return nil, err
	}

	// 生成邮箱验证码
	code := strings.ToUpper(cryptos.RandString(5))
	nextTime := ctrl.r.Now().Add(1 * time.Minute).Unix()
	expireTime := ctrl.r.Now().Add(10 * time.Minute).Unix()
	ticket, err := session.SetEmail(ctrl.r, ctrl.req.Email, code, ctrl.req.BusinessName, expireTime, nextTime)
	if err != nil {
		return nil, err
	}

	// 发送邮件
	err = sender.EmailSender.SendTo(ctrl.r, ctrl.req.Email, "【Violet】您正在进行身份验证",
		fmt.Sprintf("验证码为%s，10分钟内有效。请勿泄露验证码给他人，可能导致您的账号被盗。", code))
	if err != nil {
		return nil, err
	}
	return &api_util.SendEmailResponse{Ticket: ticket}, nil
}
