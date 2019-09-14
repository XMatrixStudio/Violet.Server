import { Controller, Get } from '@nestjs/common'

import { IGetCaptchaSuccessResponse } from '../../../packages/violet-api'

@Controller('util')
export class UtilController {
  @Get('captcha')
  async getCaptcha(): Promise<IGetCaptchaSuccessResponse> {
    return { captcha: 'aa' }
  }
}
