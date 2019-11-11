import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
// tslint:disable-next-line: no-implicit-dependencies
import { Response } from 'express'
import { IErrorResponse } from '../../packages/violet-api/response/http.response'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const errMessage =
      exception instanceof HttpException ? (exception.getResponse() as string) : 'Internal Server Error'

    switch (status) {
      case 400:
        const err: IErrorResponse = { error: errMessage }
        return response.status(status).json(err)
      case 401:
      case 403:
      case 404:
      case 405:
      case 501:
        return response
          .status(status)
          .contentType('text/plain')
          .send(errMessage)
      default:
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .contentType('text/plain')
          .send('Internal Server Error')
    }
  }
}
