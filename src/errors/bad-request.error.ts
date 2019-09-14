import { BadRequestException } from '@nestjs/common'

import { IErrorResponse } from '../../packages/violet-api/response/http.response'

export class BadRequestError extends BadRequestException {
  constructor(errMessage: string) {
    const err: IErrorResponse = { error: errMessage }
    super(err)
  }
}
