import { BadRequestError } from '../../../../src/errors/bad-request.error'
import { UtilService } from '../../../../src/modules/util/util.service'
import { ISession } from '../../../../src/types/session'

describe('UtilService', () => {
  let utilService: UtilService

  beforeEach(() => {
    utilService = new UtilService()
  })

  describe('createCaptcha', () => {
    it.todo('should run successfully')
  })

  describe('verifyCaptcha', () => {
    it.todo('should run successfully')
    it.todo('should throw 400_invalid_captcha')
    it.todo('should throw 400_timeout_captcha because of undefined captcha')

    it('should throw 400_timeout_captcha because of timeout', () => {
      const rand = Math.trunc(Math.random() * 9000 + 1000)
      const time = Date.now()
      const session = ({} as unknown) as ISession
      session.captchaCode = rand.toString()
      session.captchaTime = time - 1
      expect(() => utilService.verifyCaptcha(session, rand)).toThrow(new BadRequestError('timeout_captcha'))
    })
  })
})
