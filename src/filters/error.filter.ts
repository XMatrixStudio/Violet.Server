import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
// tslint:disable-next-line: no-implicit-dependencies
import { ConfigService } from '../modules/config/config.service'
import { IErrorResponse } from '../../packages/violet-api/response/http.response'
import { Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<Error> {
  readonly httpStatus: Array<number> = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.FORBIDDEN,
    HttpStatus.NOT_FOUND,
    HttpStatus.METHOD_NOT_ALLOWED,
    HttpStatus.NOT_IMPLEMENTED,
  ]

  constructor(private readonly configService: ConfigService) {}

  catch(exception: Error, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    let status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let errMessage: string
    if (this.httpStatus.includes(status)) errMessage = (exception as HttpException).getResponse() as string
    else {
      errMessage = 'internal_server_error'
      status = HttpStatus.INTERNAL_SERVER_ERROR
    }
    const err: IErrorResponse = {
      debug: this.configService.getAppConfig().env === 'dev' ? { error: { stack: exception.stack } } : undefined,
      error: errMessage,
    }
    return response.status(status).json(err)
  }
}
