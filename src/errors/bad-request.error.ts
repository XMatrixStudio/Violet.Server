import { HttpException, HttpStatus } from '@nestjs/common'

export class BadRequestError extends HttpException {
  readonly message: string

  constructor(errMessage: string) {
    super(errMessage, HttpStatus.BAD_REQUEST)
    this.message = `${HttpStatus.BAD_REQUEST.toString()}_${errMessage}`
  }
}
