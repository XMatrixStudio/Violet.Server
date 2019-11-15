import { Body, Controller, Post, NotImplementedException, Session } from '@nestjs/common'
import { ISession } from '../../types/session'
import { EmailService } from '../email/email.service'
import { RegisterRequest, SendEmailRequest } from './user.request'
import { UserService } from './user.service'

@Controller('api/v3/i/users')
export class UserController {
  constructor(private readonly emailService: EmailService, private readonly userService: UserService) {}

  @Post()
  async register(@Body() body: RegisterRequest) {
    await this.userService.register()
  }

  @Post('email')
  async sendEmail(@Session() session: ISession, @Body() body: SendEmailRequest) {
    switch (body.type) {
      case 'register':
        this.emailService.sendRegisterUserEmailCode(session, body.email)
        break
      case 'reset':
      case 'update':
      default:
        throw new NotImplementedException()
    }
  }
}
