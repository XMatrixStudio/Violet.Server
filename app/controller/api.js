const verify = require('../../lib/verify')
const apiService = require('../service/api')
const _ = require('lodash')
const assert = require('../../lib/assert')

exports.getToken = async ctx => {
  let body = _.pick(ctx.request.body, ['grantType', 'code', 'clientSecret'])
  verify({ data: body.grantType, type: 'string', minLength: 18, maxLength: 18, message: 'invalid_grantType' })
  verify({ data: body.code, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_code' })
  verify({ data: body.clientSecret, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_clientSecret' })
  assert(body.grantType === 'authorization_code', 'invalid_grantType')
  let res = await apiService.getToken(body.code, body.clientSecret)
  ctx.body = res
}

exports.getBaseData = async ctx => {
  let body = _.pick(ctx.request.body, ['accessToken', 'userId', 'clientSecret'])
  console.log(body.accessToken)
  verify({ data: body.accessToken, type: 'string', minLength: 128, maxLength: 1024, message: 'invalid_accessToken' })
  verify({ data: body.userId, type: 'string', minLength: 24, maxLength: 24, message: 'invalid_userId' })
  verify({ data: body.clientSecret, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_clientSecret' })
  let res = await apiService.getBaseData(body.accessToken, body.userId, body.clientSecret)
  ctx.body = res
}

exports.login = async ctx => {
  let body = _.pick(ctx.request.body, ['userName', 'userPass', 'clientSecret'])
  verify({ data: body.userName, type: 'string', message: 'invalid_param' })
  if (body.userName.toString().indexOf('@') !== -1) {
    verify({ data: body.userName, type: 'string', maxLength: 64, regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: 'invalid_email' })
  } else {
    verify({ data: body.userName, type: 'string', regExp: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: 'invalid_name' })
  }
  verify({ data: body.userPass, type: 'string', maxLength: 512, message: 'invalid_pass' })
  verify({ data: body.clientSecret, type: 'string', minLength: 20, maxLength: 512, message: 'invalid_clientSecret' })
  let result = await apiService.login(body.userName, body.userPass, body.clientSecret)
  ctx.body = result
}

exports.register = async ctx => {
  let body = _.pick(ctx.request.body, ['name', 'email', 'userPass', 'clientSecret'])
  verify({ data: body.email, type: 'string', regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, maxLength: 64, message: 'invalid_email' })
  verify({ data: body.name, type: 'string', regExp: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: 'invalid_name' })
  verify({ data: body.userPass, type: 'string', maxLength: 512, message: 'invalid_password' })
  verify({ data: body.clientSecret, type: 'string', minLength: 20, maxLength: 512, message: 'invalid_clientSecret' })
  assert(await util.checkVCode(ctx, body.vCode), 'error_code')
  await apiService.register(body.email, body.name, body.userPass, body.clientSecret)
  ctx.status = 200
}

exports.changePassword = async ctx => {
  let body = _.pick(ctx.request.body, ['email', 'password', 'vCode', 'clientSecret'])
  verify({ data: body.email, type: 'string', regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, maxLength: 64, message: 'invalid_email' })
  verify({ data: body.password, type: 'string', maxLength: 512, message: 'invalid_password' })
  verify({ data: body.vCode, type: 'string', maxLength: 6, minLength: 6, message: 'error_emailCode' })
  verify({ data: body.clientSecret, type: 'string', minLength: 20, maxLength: 512, message: 'invalid_clientSecret' })
  await apiService.changePassword(body.email, body.password, body.vCode, body.clientSecret)
  ctx.status = 200
}

exports.getEmailCode = async ctx => {
  let body = _.pick(ctx.request.body, ['email'])
  verify({ data: body.email, type: 'string', maxLength: 64, regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: 'invalid_email' })
  verify({ data: body.clientSecret, type: 'string', minLength: 20, maxLength: 512, message: 'invalid_clientSecret' })
  await apiService.getEmailCode(body.email, body.clientSecret)
  ctx.status = 200
}
