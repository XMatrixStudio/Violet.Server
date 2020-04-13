import { HttpException, HttpStatus } from '@nestjs/common'

export class BadRequestError extends HttpException {
  readonly message: string
  // readonly origin: string | Array<string>

  constructor(errMessage: string, origin?: Error | Array<Error>) {
    super(errMessage, HttpStatus.BAD_REQUEST)
    this.message = `${HttpStatus.BAD_REQUEST.toString()}_${errMessage}`
  }
}
