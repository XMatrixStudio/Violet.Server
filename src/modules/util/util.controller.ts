import { Controller, Get, NotImplementedException, Req, Session } from '@nestjs/common'

import { IGetCaptchaSuccessResponse } from '../../../packages/violet-api'
import { ISession } from '../../types/session'

@Controller('util')
export class UtilController {
  @Get('captcha')
  getCaptcha(@Session() session: ISession): IGetCaptchaSuccessResponse {
    throw new NotImplementedException()
  }
}
