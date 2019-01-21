import * as _assert from 'assert'

interface Assert {
  (...args: any[]): any
  [key: string]: any
}

const assert = <Assert>function(value: any, message?: string | Error | undefined) {
  try {
    _assert(value, message)
  } catch (err) {
    err.status = 400
    err.expose = true
    throw err
  }
}

export = assert
