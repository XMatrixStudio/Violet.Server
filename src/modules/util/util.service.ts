import { Injectable, NotImplementedException } from '@nestjs/common'
import * as CaptchaPng from 'captchapng2'

import { ISession } from '../../types/session'
import { assert } from '../../errors/assert'

@Injectable()
export class UtilService {
  createCaptcha(session: ISession): string {
    const rand = Math.trunc(Math.random() * 9000 + 1000)
    const png = new CaptchaPng(80, 30, rand)
    session.captchaCode = rand.toString()
    session.captchaTime = Date.now()
    return png.getBase64()
  }

  verifyCaptcha(session: ISession): boolean {
    throw new NotImplementedException()
  }
}
