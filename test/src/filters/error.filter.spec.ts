import { Controller, Get, HttpException, HttpStatus, INestApplication, Query } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'
import { HttpExceptionFilter } from '../../../src/filters/error.filter'

@Controller()
class TestController {
  @Get('400')
  throw400WithState(@Query('state') state: string) {
    throw new HttpException(`400_error_${state}`, HttpStatus.BAD_REQUEST)
  }
}

describe('HttpExceptionFilter', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TestController],
    }).compile()
    app = module.createNestApplication()
    app.useGlobalFilters(new HttpExceptionFilter())
    await app.init()
  })

  describe('catch', () => {
    it('should catch 400 Bad Request', () => {
      const state = Math.random().toString()
      return request(app.getHttpServer())
        .get(`/400?state=${state}`)
        .expect('Content-Type', /json/)
        .expect(400, { error: `400_error_${state}` })
    })

    it.todo('should catch 401 Unauthorized')
    it.todo('should catch 403 Forbidden')
    it.todo('should catch 404 Not Found')
    it.todo('should catch 405 Method Not Allowed')
    it.todo('should catch 500 Internal Server Error')
    it.todo('should catch 501 Not Implemented')
  })

  afterAll(async () => {
    await app.close()
  })
})
