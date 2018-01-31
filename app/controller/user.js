const userService = require('../service/user')
const verify = require('../../lib/verify')
const assert = require('../../lib/assert')
const util = require('../../lib/util')
const _ = require('lodash')

exports.login = async ctx => {
  let body = _.pick(ctx.request.body, ['userName', 'userPass', 'remember'])
  verify({ data: body.userName, type: 'string', message: 'invalid_param' })
  if (body.userName.toString().indexOf('@') !== -1) {
    verify({ data: body.userName, type: 'string', maxLength: 64, regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: 'invalid_email' })
  } else {
    verify({ data: body.userName, type: 'string', regExp: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: 'invalid_name' })
  }
  body.remember = body.remember === 'true'
  verify({ data: body.userPass, type: 'string', maxLength: 128, minLength: 128, message: 'invalid_pass' })
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
  verify({ data: body.name, type: 'string', regExp: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/, message: 'invalid_name' })
  verify({ data: body.userPass, type: 'string', maxLength: 128, minLength: 128, message: 'invalid_password' })
  verify({ data: body.vCode, type: 'string', maxLength: 4, minLength: 4, message: 'error_code' })
  assert(await util.checkVCode(ctx, body.vCode), 'error_code')
  let userId = await userService.register(body.email, body.name, body.userPass)
  // 注册后自动登陆
  ctx.session.userId = userId
  ctx.session.time = new Date()
  ctx.session.remember = false
  // 注册成功
  ctx.status = 200
}

exports.logout = async ctx => {
  ctx.session = null
  ctx.status = 200
}

exports.changePassword = async ctx => {
  let body = _.pick(ctx.request.body, ['email', 'password', 'vCode'])
  verify({ data: body.email, type: 'string', regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, maxLength: 64, message: 'invalid_email' })
  verify({ data: body.password, type: 'string', maxLength: 128, minLength: 128, message: 'invalid_password' })
  verify({ data: body.vCode, type: 'string', maxLength: 6, minLength: 6, message: 'error_emailCode' })
  await userService.changePassword(body.email, body.password, body.vCode)
  ctx.status = 200
}

exports.validEmail = async ctx => {
  let body = _.pick(ctx.request.body, ['vCode'])
  verify({ data: body.vCode, type: 'string', maxLength: 6, minLength: 6, message: 'error_emailCode' })
  await userService.validEmail((await ctx.getUserData(ctx)).email, body.vCode)
  ctx.status = 200
}

exports.getBaseInfo = async ctx => {
  ctx.body = await userService.getBaseInfo(ctx.getUserId(ctx))
}

exports.patchBaseInfo = async ctx => {
  let body = _.pick(ctx.request.body, ['gender', 'url', 'phone', 'bio', 'location', 'birthDate', 'showPhone', 'showBirthDate', 'showLocation'])
  body.birthDate = new Date(body.birthDate || '2018-1-1')
  body.show = {
    birthDate: body.showBirthDate,
    phone: body.showPhone,
    location: body.showLocation
  }
  verify({ data: body.gender, require: false, type: 'string', regExp: /^[012]$/, message: 'invalid_data' })
  verify({ data: body.bio, require: false, type: 'string', maxLength: 256, message: 'invalid_data' })
  verify({ data: body.url, require: false, type: 'string', maxLength: 256, message: 'invalid_data' })
  verify({ data: body.location, require: false, type: 'string', maxLength: 256, message: 'invalid_data' })
  verify({ data: body.phone, require: false, type: 'string', regExp: /^1[3|4|5|8][0-9]\d{4,8}$/, message: 'invalid_data' })
  verify({ data: body.birthDate, require: false, type: 'date', message: 'invalid_data' })
  verify({ data: body.show, message: 'invalid_data' })
  verify({ data: body.show.birthDate, type: 'string', regExp: /^(true)|(false)$/, message: 'invalid_data' })
  verify({ data: body.show.phone, type: 'string', regExp: /^(true)|(false)$/, message: 'invalid_data' })
  verify({ data: body.show.location, type: 'string', regExp: /^(true)|(false)$/, message: 'invalid_data' })
  await userService.patchBaseInfo(ctx.getUserId(ctx), body)
  ctx.status = 200
}

exports.loginState = async ctx => {
  ctx.status = 200
}

exports.avatar = async ctx => {
  let body = _.pick(ctx.request.body, ['avatar'])
  verify({ data: body.avatar, type: 'string', maxLength: 100000, message: 'invalid_avatar' })
  userService.avatar(ctx.getUserId(ctx), body.avatar)
  ctx.status = 200
}
