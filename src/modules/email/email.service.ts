import { Injectable, NotImplementedException } from '@nestjs/common'
import { Transporter } from 'nodemailer'
import { ISession } from '../../types/session'

@Injectable()
export class EmailService {
  private readonly transporter: Transporter

  constructor() {
    this.transporter = {} as Transporter
  }

  sendRegisterUserEmailCode(session: ISession, email: string) {
    throw new NotImplementedException()
  }

  verifyEmailCode(session: ISession, email: string, type: string, code: string) {
    throw new NotImplementedException()
  }

  private sendEmail() {
    throw new NotImplementedException()
  }
}
