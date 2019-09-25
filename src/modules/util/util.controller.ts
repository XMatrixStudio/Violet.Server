import { Controller, Get, NotImplementedException, Req, Session } from '@nestjs/common'

import { IGetCaptchaSuccessResponse } from '../../../packages/violet-api'

@Controller('util')
export class UtilController {
  @Get('captcha')
  getCaptcha(@Session() session: Express.Session): IGetCaptchaSuccessResponse {
    throw new NotImplementedException()
  }
}
