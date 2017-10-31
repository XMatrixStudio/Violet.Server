const _assert = require('assert')
const log = require('./log')

const assert = function(...args) {
  try {
    _assert(...args)
  } catch (err) {
    err.status = 400
    err.expose = true
    log.warn(err.stack)
    throw err
  }
}

for (let key in _assert) {
  assert[key] = function(...args) {
    try {
      _assert[key](...args)
    } catch (err) {
      err.status = 400
      err.expose = true
      throw err
    }
  }
}

module.exports = assert
