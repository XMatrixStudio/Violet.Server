package sender

import (
	"crypto/tls"
	"fmt"
	"net/smtp"

	"github.com/jordan-wright/email"
	"github.com/xmatrixstudio/violet.server/app/api"
	"github.com/xmatrixstudio/violet.server/app/config"
	"go.uber.org/zap"
)

type emailSender struct {
	addr     string
	host     string
	user     string
	password string
	authUser string
}

func newEmailSender(cfg config.Config) *emailSender {
	return &emailSender{
		addr:     fmt.Sprintf("%s:%d", cfg.Email.Host, cfg.Email.Port),
		host:     cfg.Email.Host,
		user:     cfg.Email.User,
		password: cfg.Email.Password,
		authUser: cfg.Email.AuthUser,
	}
}

func (sdr *emailSender) SendTo(r *api.RequestContext, to, subject, text string) error {
	dialer := email.NewEmail()
	dialer.From = sdr.authUser
	dialer.To = []string{to}
	dialer.Subject = subject
	dialer.Text = []byte(text)
	if err := dialer.SendWithTLS(sdr.addr, smtp.PlainAuth("", sdr.user, sdr.password, sdr.host), &tls.Config{ServerName: sdr.host}); err != nil {
		r.Logger().Error("email.SendWithTLS fail", zap.Error(err))
		return err
	}
	return nil
}
