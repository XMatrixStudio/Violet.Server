const userService = require('../service/user')
const verify = require('../../lib/verify')
const assert = require('../../lib/assert')
const util = require('../../lib/util')
const _ = require('lodash')

exports.login = async ctx => {
  let body = _.pick(ctx.request.body, ['userName', 'userPass', 'remember'])
  console.log('body:', body)
  assert(body.userName, 'invalid_param')
  if (body.userName.toString().indexOf('@') !== -1) {
    verify({ data: body.userName, type: 'string', maxLength: 64, regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: 'invalid_email' })
  } else {
    verify({ data: body.userName, type: 'string', regExp: /^[a-zA-Z][a-zA-Z0-9_]{3,18}$/, message: 'invalid_name' })
  }
  body.userName = body.userName.toString().toLowerCase()
  body.remember = body.remember === 'true'
  verify({ data: body.userPass, type: 'string', message: 'invalid_pass' })
  let result = await userService.login(body.userName, body.userPass)
  ctx.session.userId = result.id
  ctx.session.time = new Date()
  ctx.session.remember = body.remember
  delete result.id
  ctx.body = result
}

exports.register = async ctx => {
  let body = _.pick(ctx.request.body, ['name', 'email', 'userPass', 'vCode'])
  verify({ data: body.email, type: 'string', regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, maxLength: 64, message: 'invalid_email' })
  verify({ data: body.name, type: 'string', regExp: /^[a-zA-Z][a-zA-Z0-9_]{3,18}$/, message: 'invalid_name' })
  verify({ data: body.userPass, type: 'string', maxLength: 64, minLength: 6, message: 'invalid_password' })
  let regExp = /^[0-9]$/
  assert(!regExp.test(body.userPass), 'invalid_password') // 不允许纯数字密码
  verify({ data: body.vCode, type: 'string', maxLength: 4, minLength: 4, message: 'error_code' })
  assert(await util.checkVCode(ctx, body.vCode), 'error_code')
  await userService.register(body.email, body.name, body.userPass)
  ctx.state = 200
}

exports.logout = async ctx => {
  ctx.session.userId = null
  ctx.state = 200
}

exports.changePassword = async ctx => {
  let body = _.pick(ctx.request.body, ['email', 'password', 'vCode'])
  verify({ data: body.email, type: 'string', regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, maxLength: 64, message: 'invalid_email' })
  verify({ data: body.password, type: 'string', maxLength: 64, minLength: 6, message: 'invalid_password' })
  verify({ data: body.vCode, type: 'string', maxLength: 4, minLength: 4, message: 'error_code' })
  await userService.changePassword(body.email, body.password, body.vCode)
  ctx.state = 200
}

exports.validEmail = async ctx => {
  let body = _.pick(ctx.request.body, ['vCode'])
  verify({ data: body.vCode, type: 'string', maxLength: 4, minLength: 4, message: 'error_code' })
  await userService.validEmail(ctx.userData().email, body.vCode)
  ctx.state = 200
}

exports.getBaseInfo = async ctx => {
  ctx.body = await userService.getInfo(ctx.getUserId())
}
