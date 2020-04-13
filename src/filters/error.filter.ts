import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, BadRequestException } from '@nestjs/common'
import { Response } from 'express'
import { IErrorResponse } from '../../packages/violet-api/response/http.response'
import { ConfigService } from '../modules/config/config.service'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<Error> {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: Error, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    let status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let errMessage: string
    let res: string | object
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        res = (exception as HttpException).getResponse()
        if (typeof res === 'string') errMessage = res
        else errMessage = (res as { message: string }).message
        break
      case HttpStatus.UNAUTHORIZED:
        errMessage = 'unauthorized'
        break
      case HttpStatus.FORBIDDEN:
        errMessage = 'forbidden'
        break
      case HttpStatus.NOT_FOUND:
        errMessage = 'not_found'
        break
      case HttpStatus.METHOD_NOT_ALLOWED:
        errMessage = 'method_not_allowed'
        break
      case HttpStatus.NOT_IMPLEMENTED:
        errMessage = 'not_implemented'
        break
      default:
        errMessage = 'internal_server_error'
        status = HttpStatus.INTERNAL_SERVER_ERROR
    }

    console.log(exception)
    const err: IErrorResponse = {
      debug: this.configService.getAppConfig().env === 'dev' ? { error: exception } : undefined,
      error: errMessage,
    }
    return response.status(status).json(err)
  }
}
