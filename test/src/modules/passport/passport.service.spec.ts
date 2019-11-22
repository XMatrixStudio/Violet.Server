import { Repository } from 'typeorm'
import { PassportService } from '../../../../src/modules/passport/passport.service'
import { Passport } from '../../../../src/modules/passport/passport.entity'

describe('PassportService', () => {
  let passportService: PassportService
  let passportRepo: Repository<Passport>
  beforeAll(() => {
    passportService = new PassportService(passportRepo)
  })

  describe('[private] hashPassword', () => {
    it('should hash password by new salt', () => {
      const hash = passportService['hashPassword']('Violet')
      expect(hash.password).toBe(passportService['hashString'](passportService['hashString']('Violet') + hash.salt))
      expect(hash.salt).toHaveLength(64)
    })

    it('should hash password by specified salt', () => {
      const hash = passportService['hashPassword']('Violet', '123456')
      expect(hash.password).toBe(
        '364d24fe73ec3b6e1388512b0913efc27f6adb2219ec0c2bae6585ca2c18d8fc102e75f9aa66cc4b9e01b8e9da8ae329f1b700fa741130290551f217faa80270',
      )
      expect(hash.salt).toBe('123456')
    })
  })

  describe('[private] hashString', () => {
    it('should hash string by sha512', () => {
      expect(passportService['hashString']('Violet')).toBe(
        'ddcc4c4292e79ae938feb8afd047e4103d7bd940629e80ca25caab684371de1c35a2a0fab6bb07eb81de48c8ed56496684a44931752a7f883bf1822f7393aa57',
      )
    })
  })

  describe('[private] randomSalt', () => {
    it('should random salt by odd length', () => expect(passportService['randomSalt'](63)).toMatch(/^[0-9a-f]{63}$/))
    it('should random salt by even length', () => expect(passportService['randomSalt'](64)).toMatch(/^[0-9a-f]{64}$/))
  })
})
