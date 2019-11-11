import { UtilController } from '../../../../src/modules/util/util.controller'
import { UtilService } from '../../../../src/modules/util/util.service'
import { ISession } from '../../../../src/types/session'

describe('UtilController', () => {
  let utilController: UtilController
  let utilService: UtilService

  beforeEach(() => {
    utilService = new UtilService()
    utilController = new UtilController(utilService)
  })

  describe('getCaptcha', () => {
    it('should return data uri scheme of png base64 string', () => {
      const session = ({} as unknown) as ISession
      const randStr = Math.random().toString()
      const spy = jest.spyOn(utilService, 'createCaptcha').mockImplementation(() => randStr)
      expect(utilController.getCaptcha(session)).toStrictEqual({ captcha: 'data:image/png;base64,'.concat(randStr) })
      spy.mockRestore()
    })
  })
})
