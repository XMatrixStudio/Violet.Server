import * as _assert from 'assert'

import { HttpException } from '@nestjs/common'
import { BadRequestError } from './bad-request.error'

export function assert(value: unknown, message: string, status = 400) {
  try {
    _assert(value, message)
  } catch (err) {
    const assertErr = err as _assert.AssertionError
    switch (status) {
      case 400:
        throw new BadRequestError(assertErr.message)
      default:
        throw new Error()
    }
  }
}
