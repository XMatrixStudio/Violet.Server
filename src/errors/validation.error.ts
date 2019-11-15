import { HttpException, ValidationError } from '@nestjs/common'

import { BadRequestError } from './bad-request.error'

export function validationErrorFactory(_: Array<ValidationError>): HttpException {
  return new BadRequestError('invalid_params')
}
