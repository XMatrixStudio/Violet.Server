import { Controller, Get, NotImplementedException, Req, Session } from '@nestjs/common'

import { IGetCaptchaSuccessResponse } from '../../../packages/violet-api'
import { ISession } from '../../types/session'
import { UtilService } from './util.service'

@Controller('util')
export class UtilController {
  constructor(private readonly utilService: UtilService) {}

  @Get('captcha')
  getCaptcha(@Session() session: ISession): IGetCaptchaSuccessResponse {
    return { captcha: 'data:image/png;base64,'.concat(this.utilService.createCaptcha(session, 5 * 60 * 1000)) }
  }
}
