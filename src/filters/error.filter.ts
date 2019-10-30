import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
// tslint:disable-next-line: no-implicit-dependencies
import { Response } from 'express'
import { IErrorResponse } from '../../packages/violet-api/response/http.response'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR
    const errMessage = exception.getResponse() as string
    switch (status) {
      case 400:
        const err: IErrorResponse = { error: errMessage }
        return response.status(status).json(err)
      case 500:
      default:
        return response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .contentType('text/plain')
          .send('Internal Server Error')
    }
  }
}
