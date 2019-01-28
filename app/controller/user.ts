import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as verify from '../../lib/verify'
import * as userService from '../service/user'

const emailExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/

export const get = async (ctx: Context) => {
  ctx.status = 200
}

/**
 * 注册用户
 */
export const post = async (ctx: Context) => {
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

export const postSession = async (ctx: Context) => {
  // const body = _.pick(ctx.request.body, ['user', 'password', 'remember'])
  // let email: string | null = null
  // let name: string | null = null
  // verify({ data: body.user, require: true, type: 'string', message: 'invalid_user' })
  // if (body.user.indexOf('@') !== -1) {
  //   verify({ data: body.user, require: true, type: 'string', maxLength: 64, regExp: emailExp, message: 'invalid_email' })
  //   email = body.user
  // } else {
  //   verify({ data: body.user, require: true, type: 'string', regExp: nameExp, message: 'invalid_name' })
  //   name = body.user
  // }
  // verify({ data: body.password, type: 'string', maxLength: 128, minLength: 128, message: 'invalid_password' })
  // body.remember = body.remember === 'true'
  // const user = await userService.login(email, name, body.password)
  // ctx.session!.userId = user.id
  // ctx.session!.time = new Date()
  // ctx.session!.remember = body.remember
  // delete user.id
  // ctx.body = user
  // ctx.status = 201
}

export const deleteSession = async (ctx: Context) => {
  ctx.session = null
  ctx.status = 204
}
