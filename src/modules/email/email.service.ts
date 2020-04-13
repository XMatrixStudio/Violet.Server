import { Injectable, NotImplementedException } from '@nestjs/common'
import * as fs from 'fs'
import { createTransport, Transporter } from 'nodemailer'
import { assert } from '../../errors/assert'
import { ISession } from '../../types/session'
import { ConfigService } from '../config/config.service'

@Injectable()
export class EmailService {
  private readonly transporter: Transporter

  private readonly layout: string
  private readonly registerLayout: string

  constructor(private readonly configService: ConfigService) {
    const emailConfig = configService.getEmailConfig()
    this.transporter = createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      auth: { user: emailConfig.user, pass: emailConfig.password },
      secure: false,
      tls: { ciphers: 'SSLv3' },
    })
    this.layout = fs.readFileSync('layout/email.html', 'utf-8')
    this.registerLayout = fs.readFileSync('layout/register.email.html', 'utf-8')
  }

  sendRegisterUserEmailCode(session: ISession, email: string) {
    this.getEmailCode(session, email, 'register', 600 * 1000, 60 * 1000)
    throw new NotImplementedException()
  }

  verifyEmailCode(session: ISession, email: string, type: string, code: string) {
    assert(Date.now() < session.emailTime, 'timeout_code')
    const success = email === session.email && type === session.emailType && code === session.emailCode
    delete session.email
    delete session.emailCode
    delete session.emailTime
    delete session.emailType
    assert(success, 'invalid_code')
  }

  private getEmailCode(session: ISession, email: string, type: string, expireDuration: number, limitDuration: number): string {
    assert(Date.now() + expireDuration > session.emailTime + limitDuration, 'limit_time')
    let code: string
    if (this.configService.getAppConfig().env === 'dev') code = '123456'
    else code = Math.trunc(Math.random() * 900000 + 100000).toString()
    session.email = email
    session.emailCode = code
    session.emailTime = Date.now() + expireDuration
    session.emailType = type
    return code
  }

  private sendEmail() {
    throw new NotImplementedException()
  }
}
