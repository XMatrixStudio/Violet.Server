import { Injectable } from '@nestjs/common'
import * as CaptchaPng from 'captchapng2'
import { assert } from '../../errors/assert'
import { ISession } from '../../types/session'

@Injectable()
export class UtilService {
  createCaptcha(session: ISession, expireDuration: number): string {
    const rand = Math.trunc(Math.random() * 9000 + 1000)
    const png = new CaptchaPng(80, 30, rand)
    session.captchaCode = rand.toString()
    session.captchaTime = Date.now() + expireDuration
    return png.getBase64()
  }

  verifyCaptcha(session: ISession, captcha: number) {
    assert(Date.now() < session.captchaTime, 'timeout_captcha')
    assert(captcha.toString() === session.captchaCode, 'invalid_captcha')
    delete session.captchaCode
    delete session.captchaTime
  }
}
