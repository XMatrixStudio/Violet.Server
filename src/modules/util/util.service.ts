import { Injectable, NotImplementedException } from '@nestjs/common'
import * as CaptchaPng from 'captchapng2'

import { ISession } from '../../types/session'

@Injectable()
export class UtilService {
  createCaptcha(session: ISession): string {
    const rand = Math.trunc(Math.random() * 9000 + 1000)
    const png = new CaptchaPng(80, 30, rand)
    return png.getBase64()
  }

  verifyCaptcha(session: ISession): boolean {
    throw new NotImplementedException()
  }
}
