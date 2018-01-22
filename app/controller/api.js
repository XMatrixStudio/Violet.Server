const verify = require('../../lib/verify')
const apiService = require('../service/api')
const _ = require('lodash')
const assert = require('../../lib/assert')

exports.getToken = ctx => {
  let body = _.pick(ctx.request.body, ['grantType', 'code', 'clientSecret'])
  verify({ data: body.grantType, type: 'string', maxLength: 18, minLength: 18, message: 'invalid_grantType' })
  verify({ data: body.code, type: 'string', maxLength: 128, minLength: 512, message: 'invalid_code' })
  verify({ data: body.clientSecret, type: 'string', maxLength: 128, minLength: 512, message: 'invalid_clientSecret' })
  assert(body.grantType === 'authorization_code', 'invalid_grantType')
  let res = apiService.getToken(body.code, body.clientSecret)
  ctx.body = res
}

exports.getBaseData = ctx => {
  let body = _.pick(ctx.request.body, ['accessToken', 'userId', 'clientSecret'])
  verify({ data: body.accessToken, type: 'string', maxLength: 128, minLength: 512, message: 'invalid_accessToken' })
  verify({ data: body.userId, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_userId' })
  verify({ data: body.clientSecret, type: 'string', maxLength: 128, minLength: 512, message: 'invalid_clientSecret' })
  let res = apiService.getBaseData(body.accessToken, body.userId, body.clientSecret)
  ctx.body = res
}
