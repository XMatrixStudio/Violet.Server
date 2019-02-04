import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as verify from '../../lib/verify'
import * as userService from '../service/user'

const emailExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
const genderExp = /^[012]$/
const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/
const nicknameExp = /^([a-zA-Z0-9_-]|\p{Script=Hani})+$/gu
const urlExp = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

/**
 * 获取用户信息
 */
export async function get(ctx: Context): Promise<void> {
  ctx.body = await userService.getInfo(ctx.session!.user.id!)
  ctx.status = 200
}

/**
 * 注册用户
 */
export async function post(ctx: Context): Promise<void> {
  const body = _.pick(ctx.request.body, ['name', 'nickname', 'password'])
  assert.v({ data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' })
  assert.v({ data: body.nickname, require: false, type: 'string', regExp: nicknameExp, maxLength: 32, message: 'invalid_nickname' })
  assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
  body.nickname = body.nickname || body.name

  assert(ctx.session!.verify.email, 'not_exist_email')
  await userService.register(ctx.session!.verify.email!, '', body.name, body.nickname, body.password)
  ctx.session!.verify.email = undefined
  ctx.status = 201
}

/**
 * 修改用户个人信息
 */
export async function patch(ctx: Context): Promise<void> {
  const body = _.pick(ctx.request.body, ['secure', 'info'])
  if (body.secure) {
    body.secure = _.pick(body.secure, ['old_password', 'new_password'])
    assert.v({ data: body.secure.old_password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
    assert.v({ data: body.secure.new_password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
    await userService.updatePassword(ctx.session!.user.id!, body.secure.old_password, body.secure.new_password)
  }
  if (body.info && !_.isEmpty(body.info)) {
    body.info = _.pick(body.info, ['avatar', 'bio', 'birthday', 'email', 'gender', 'location', 'nickname', 'phone', 'url'])
    assert.v({ data: body.info.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_info' })
    assert.v({ data: body.info.bio, require: false, type: 'string', maxLength: 128, message: 'invalid_info' })
    assert.v({ data: body.info.birthday, require: false, type: 'past', message: 'invalid_birthday' })
    assert.v({ data: body.info.email, require: false, type: 'string', regExp: emailExp, maxLength: 64, message: 'invalid_info' })
    assert.v({ data: body.info.gender, require: false, type: 'number', regExp: genderExp, message: 'invalid_info' })
    assert.v({ data: body.info.location, require: false, type: 'string', maxLength: 64, message: 'invalid_info' })
    assert.v({ data: body.info.nickname, require: false, type: 'string', regExp: nicknameExp, maxLength: 32, message: 'invalid_info' })
    assert.v({ data: body.info.phone, require: false, type: 'string', message: 'invalid_info' })
    assert.v({ data: body.info.url, require: false, type: 'string', regExp: urlExp, maxLength: 128, message: 'invalid_info' })
    await userService.updateInfo(ctx.session!.user.id!, body.info)
  }
  ctx.status = 200
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
  assert(await verify.sendEmailCode(ctx, body.email, '大肥真'), 'send_fail')
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
export async function postSession(ctx: Context): Promise<void> {
  const body = _.pick(ctx.request.body, ['user', 'password', 'remember'])
  assert.v({ data: body.user, type: 'string', message: 'invalid_user' })
  assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
  body.remember = body.remember === 'true'

  let userId
  if (body.user.indexOf('@') !== -1) {
    assert.v({ data: body.user, type: 'string', maxLength: 64, regExp: emailExp, message: 'invalid_email' })
    userId = await userService.login({ email: body.user }, body.password)
  } else if (body.user[0] >= '0' && body.user[0] <= '9') {
    assert.v({ data: body.user, type: 'string', minLength: 11, maxLength: 11, message: 'invalid_phone' })
    userId = await userService.login({ phone: body.user }, body.password)
  } else {
    assert.v({ data: body.user, type: 'string', regExp: nameExp, message: 'invalid_name' })
    userId = await userService.login({ name: body.user }, body.password)
  }

  ctx.session!.user.id = userId
  ctx.session!.user.time = Date.now()
  ctx.session!.user.remember = body.remember
  ctx.status = 201
}

export async function deleteSession(ctx: Context): Promise<void> {
  ctx.session = null
  ctx.status = 204
}
