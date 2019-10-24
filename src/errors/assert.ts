import * as _assert from 'assert'

import { BadRequestError } from './bad-request.error'

export function assert(value: any, message: string, status: number = 400) {
  try {
    _assert(value, message)
  } catch (err) {
    throw new BadRequestError((err as Error).message)
  }
}
