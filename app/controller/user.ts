import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as verify from '../../lib/verify'
import * as userService from '../service/user'
import { User } from '../model/user'

const emailExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/

/**
 * 获取用户信息
 */
export async function get(ctx: Context) {
  ctx.status = 200
}

/**
 * 注册用户
 */
export async function post(ctx: Context) {
  const body = _.pick(ctx.request.body, ['name', 'nickname', 'password'])
  assert.v({ data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' })
  assert.v({ data: body.nickname, require: false, type: 'string', maxLength: 32, message: 'invalid_nickname' })
  assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
  body.nickname = body.nickname || body.name

  assert(ctx.session!.verify.email, 'not_exist_email')
  assert(await userService.register(ctx.session!.verify.email!, '', body.name, body.nickname, body.password), 'unknown_error')
  ctx.session!.verify.email = undefined
  ctx.status = 201
}

/**
 * 发送邮箱验证邮件
 */
export async function postEmail(ctx: Context): Promise<void> {
  const body = _.pick(ctx.request.body, ['operator', 'captcha', 'email'])
  assert.v({ data: body.operator, type: 'string', enums: ['register'], message: 'invalid_operator' })
  assert.v({ data: body.captcha, type: 'string', minLength: 4, maxLength: 4, message: 'invalid_captcha' })
  assert.v({ data: body.email, type: 'string', regExp: emailExp, maxLength: 64, message: 'invalid_email' })

  assert(ctx.session!.verify.captcha, 'not_exist_captcha')
  assert(verify.checkCaptcha(ctx, body.captcha), 'error_captcha')
  assert((await userService.checkIfExistUserByEmail(body.email)) === false, 'exist_email')
  assert(await verify.sendEmailCode(ctx, body.email, '大肥真'), 'unknown_error')
  ctx.status = 201
}

/**
 * 验证邮箱
 */
export async function putEmail(ctx: Context): Promise<void> {
  const body = _.pick(ctx.request.body, ['operator', 'code'])
  assert.v({ data: body.operator, type: 'string', enums: ['register'], message: 'invalid_operator' })
  assert.v({ data: body.code, type: 'string', minLength: 6, maxLength: 6, message: 'invalid_code' })

  assert(ctx.session!.verify.emailTime, 'not_exist_code')
  assert(Date.now() - ctx.session!.verify.emailTime! < 300 * 1000, 'timeout_code')
  assert(verify.checkEmailCode(ctx, body.code), 'error_code')
  ctx.status = 200
}

/**
 * 用户登陆
 */
export async function postSession(ctx: Context) {
  const body = _.pick(ctx.request.body, ['user', 'password', 'remember'])
  assert.v({ data: body.user, type: 'string', message: 'invalid_user' })
  assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
  body.remember = body.remember === 'true'

  let user
  if (body.user.indexOf('@') !== -1) {
    assert.v({ data: body.user, type: 'string', maxLength: 64, regExp: emailExp, message: 'invalid_email' })
    user = await userService.login({ email: body.user }, body.password)
  } else if (body.user[0] >= '0' && body.user[0] <= '9') {
    assert.v({ data: body.user, type: 'string', minLength: 11, maxLength: 11, message: 'invalid_phone' })
    user = await userService.login({ phone: body.user }, body.password)
  } else {
    assert.v({ data: body.user, type: 'string', regExp: nameExp, message: 'invalid_name' })
    user = await userService.login({ name: body.user }, body.password)
  }

  ctx.session!.user.id = user.id
  ctx.session!.user.time = Date.now()
  ctx.session!.user.remember = body.remember
  delete user.id
  ctx.body = user
  ctx.status = 201
}

export async function deleteSession(ctx: Context) {
  ctx.session = null
  ctx.status = 204
}
