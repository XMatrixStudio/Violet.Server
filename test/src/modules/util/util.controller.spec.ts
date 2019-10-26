import { UtilController } from '../../../../src/modules/util/util.controller'
import { UtilService } from '../../../../src/modules/util/util.service'

describe('UtilController', () => {
  let utilController: UtilController
  let utilService: UtilService

  beforeEach(() => {
    utilService = new UtilService()
    utilController = new UtilController(utilService)
  })

  describe('getCaptcha', () => {
    it.todo('should return data uri scheme of png base64 string')
  })
})
