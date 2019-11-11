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

  @Get('401')
  throw401() {
    throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED)
  }

  @Get('403')
  throw403() {
    throw new HttpException(`Forbidden`, HttpStatus.FORBIDDEN)
  }

  @Get('404')
  throw404() {
    throw new HttpException(`Not Found`, HttpStatus.NOT_FOUND)
  }

  @Get('405')
  throw405() {
    throw new HttpException(`Method Not Allowed`, HttpStatus.METHOD_NOT_ALLOWED)
  }

  @Get('500')
  throw500() {
    throw new HttpException(`Internal Server Error`, HttpStatus.INTERNAL_SERVER_ERROR)
  }

  @Get('501')
  throw501() {
    throw new HttpException(`Not Implemented`, HttpStatus.NOT_IMPLEMENTED)
  }

  @Get('502')
  throw502() {
    throw new HttpException(`Bad Gateway`, HttpStatus.BAD_GATEWAY)
  }

  @Get('error')
  throwNormalError() {
    throw new Error('Normal Error')
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
        .expect('Content-Type', /application\/json/)
        .expect(400, { error: `400_error_${state}` })
    })

    it('should catch 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get(`/401`)
        .expect('Content-Type', /text\/plain/)
        .expect(401, 'Unauthorized')
    })

    it('should catch 403 Forbidden', () => {
      return request(app.getHttpServer())
        .get(`/403`)
        .expect('Content-Type', /text\/plain/)
        .expect(403, 'Forbidden')
    })

    it('should catch 404 Not Found', () => {
      return request(app.getHttpServer())
        .get(`/404`)
        .expect('Content-Type', /text\/plain/)
        .expect(404, 'Not Found')
    })

    it('should catch 405 Method Not Allowed', () => {
      return request(app.getHttpServer())
        .get(`/405`)
        .expect('Content-Type', /text\/plain/)
        .expect(405, 'Method Not Allowed')
    })

    it('should catch 500 Internal Server Error', () => {
      return request(app.getHttpServer())
        .get(`/500`)
        .expect('Content-Type', /text\/plain/)
        .expect(500, 'Internal Server Error')
    })

    it('should catch 500 Internal Server Error caused by 502', () => {
      return request(app.getHttpServer())
        .get(`/502`)
        .expect('Content-Type', /text\/plain/)
        .expect(500, 'Internal Server Error')
    })

    it('should catch 500 Internal Server Error caused by normal error', () => {
      return request(app.getHttpServer())
        .get(`/error`)
        .expect('Content-Type', /text\/plain/)
        .expect(500, 'Internal Server Error')
    })

    it('should catch 501 Not Implemented', () => {
      return request(app.getHttpServer())
        .get(`/501`)
        .expect('Content-Type', /text\/plain/)
        .expect(501, 'Not Implemented')
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
