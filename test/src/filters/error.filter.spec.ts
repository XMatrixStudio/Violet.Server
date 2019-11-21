import { Controller, Get, HttpException, HttpStatus, INestApplication, Query } from '@nestjs/common'
import { ConfigModule } from '../../../src/modules/config/config.module'
import { ConfigService } from '../../../src/modules/config/config.service'
import { HttpExceptionFilter } from '../../../src/filters/error.filter'
import { IAppConfig } from '../../../src/modules/config/config.entity'
import { IErrorResponse } from '../../../packages/violet-api/response/http.response'
import * as request from 'supertest'
import { Test } from '@nestjs/testing'

@Controller()
class TestController {
  @Get('400')
  throw400WithState(@Query('state') state: string) {
    throw new HttpException(`400_error_${state}`, HttpStatus.BAD_REQUEST)
  }

  @Get('401')
  throw401() {
    throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED)
  }

  @Get('403')
  throw403() {
    throw new HttpException('forbidden', HttpStatus.FORBIDDEN)
  }

  @Get('404')
  throw404() {
    throw new HttpException('not_found', HttpStatus.NOT_FOUND)
  }

  @Get('405')
  throw405() {
    throw new HttpException('method_not_allowed', HttpStatus.METHOD_NOT_ALLOWED)
  }

  @Get('500')
  throw500() {
    throw new HttpException('internal_server_error', HttpStatus.INTERNAL_SERVER_ERROR)
  }

  @Get('501')
  throw501() {
    throw new HttpException('not_implemented', HttpStatus.NOT_IMPLEMENTED)
  }

  @Get('502')
  throw502() {
    throw new HttpException('bad_gateway', HttpStatus.BAD_GATEWAY)
  }

  @Get('error')
  throwNormalError() {
    throw new Error('normal_error')
  }
}

describe('HttpExceptionFilter', () => {
  let app: INestApplication
  let configService: ConfigService
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TestController],
      imports: [ConfigModule],
      providers: [ConfigService],
    }).compile()
    app = module.createNestApplication()
    configService = app.get<ConfigService>(ConfigService)
    app.useGlobalFilters(new HttpExceptionFilter(configService))
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })

  describe('catch', () => {
    describe('test in dev environment', () => {
      let spy: jest.SpyInstance<IAppConfig, []>
      beforeAll(() => {
        spy = jest.spyOn(configService, 'getAppConfig').mockImplementation(() => ({ env: 'dev' } as IAppConfig))
      })
      afterAll(() => spy.mockRestore())

      it('should catch debug', async () => {
        const res = await request(app.getHttpServer()).get('/500')
        const body = res.body as IErrorResponse
        expect(body.debug).not.toBeNull()
        expect(body.debug!.error.stack).not.toBeNull()
        expect(body.debug!.error.stack!.indexOf('Error: internal_server_error\n')).toBe(0)
      })
    })

    describe('test in prod environment', () => {
      let spy: jest.SpyInstance<IAppConfig, []>
      beforeAll(() => {
        spy = jest.spyOn(configService, 'getAppConfig').mockImplementation(() => ({ env: 'prod' } as IAppConfig))
      })
      afterAll(() => spy.mockRestore())

      it('should catch 400 Bad Request', () => {
        const state = Math.random().toString()
        return request(app.getHttpServer())
          .get(`/400?state=${state}`)
          .expect('Content-Type', /application\/json/)
          .expect(400, { error: `400_error_${state}` })
      })

      it('should catch 401 Unauthorized', () => {
        return request(app.getHttpServer())
          .get('/401')
          .expect('Content-Type', /application\/json/)
          .expect(401, { error: 'unauthorized' })
      })

      it('should catch 403 Forbidden', () => {
        return request(app.getHttpServer())
          .get('/403')
          .expect('Content-Type', /application\/json/)
          .expect(403, { error: 'forbidden' })
      })

      it('should catch 404 Not Found', () => {
        return request(app.getHttpServer())
          .get('/404')
          .expect('Content-Type', /application\/json/)
          .expect(404, { error: 'not_found' })
      })

      it('should catch 405 Method Not Allowed', () => {
        return request(app.getHttpServer())
          .get('/405')
          .expect('Content-Type', /application\/json/)
          .expect(405, { error: 'method_not_allowed' })
      })

      it('should catch 500 Internal Server Error', () => {
        return request(app.getHttpServer())
          .get('/500')
          .expect('Content-Type', /application\/json/)
          .expect(500, { error: 'internal_server_error' })
      })

      it('should catch 500 Internal Server Error caused by 502', () => {
        return request(app.getHttpServer())
          .get('/502')
          .expect('Content-Type', /application\/json/)
          .expect(500, { error: 'internal_server_error' })
      })

      it('should catch 500 Internal Server Error caused by normal error', () => {
        return request(app.getHttpServer())
          .get('/error')
          .expect('Content-Type', /application\/json/)
          .expect(500, { error: 'internal_server_error' })
      })

      it('should catch 501 Not Implemented', () => {
        return request(app.getHttpServer())
          .get('/501')
          .expect('Content-Type', /application\/json/)
          .expect(501, { error: 'not_implemented' })
      })
    })
  })
})
