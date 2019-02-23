import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as verify from '../../lib/verify'
import * as userService from '../service/user'

const emailExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
const genderExp = /^[012]$/
const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/
const nicknameExp = /^([a-zA-Z0-9_-]|\p{Script=Hani})+$/gu
const phoneExp = /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[01356789]\d{2}|4(?:0\d|1[0-2]|9\d))|9[189]\d{2}|6[567]\d{2}|4[579]\d{2})\d{6}$/
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
  const body = _.pick<User.POST.RequestBody>(ctx.request.body, ['name', 'nickname', 'password'])
  assert.v({ data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' })
  assert.v({ data: body.nickname, require: false, type: 'string', regExp: nicknameExp, maxLength: 32, message: 'invalid_nickname' })
  assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
  body.nickname = body.nickname || body.name!

  assert(ctx.session!.user.register, 'not_exist_register_record')
  switch (ctx.session!.user.register) {
    case 'email': {
      await userService.register(ctx.session!.verify.email!, '', body.name!, body.nickname, body.password!)
      break
    }
    case 'phone': {
      await userService.register('', ctx.session!.verify.phone!, body.name!, body.nickname, body.password!)
      break
    }
  }
  ctx.session!.user.register = undefined
  ctx.status = 201
}

/**
 * 修改用户个人信息
 */
export async function patch(ctx: Context): Promise<void> {
  const body = _.pick<User.PATCH.RequestBody>(ctx.request.body, ['secure', 'info'])
  if (body.secure) {
    body.secure = _.pick(body.secure, ['old_password', 'new_password'])
    assert.v({ data: body.secure.old_password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_old_password' })
    assert.v({ data: body.secure.new_password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_new_password' })
    await userService.updatePassword(ctx.session!.user.id!, body.secure.old_password!, body.secure.new_password!)
  }
  if (body.info && !_.isEmpty(body.info)) {
    body.info = _.pick(body.info, ['avatar', 'bio', 'birthday', 'email', 'gender', 'location', 'nickname', 'phone', 'url'])
    if (body.info.birthday) body.info.birthday = new Date(body.info.birthday as string)
    assert.v({ data: body.info.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' })
    assert.v({ data: body.info.bio, require: false, type: 'string', maxLength: 128, message: 'invalid_bio' })
    assert.v({ data: body.info.birthday, require: false, type: 'past', message: 'invalid_birthday' })
    assert.v({ data: body.info.email, require: false, type: 'string', regExp: emailExp, maxLength: 64, message: 'invalid_email' })
    assert.v({ data: body.info.gender, require: false, type: 'number', regExp: genderExp, message: 'invalid_gender' })
    assert.v({ data: body.info.location, require: false, type: 'string', maxLength: 64, message: 'invalid_location' })
    assert.v({ data: body.info.nickname, require: false, type: 'string', regExp: nicknameExp, maxLength: 32, message: 'invalid_nickname' })
    assert.v({ data: body.info.phone, require: false, type: 'string', regExp: phoneExp, message: 'invalid_phone' })
    assert.v({ data: body.info.url, require: false, type: 'string', regExp: urlExp, maxLength: 128, message: 'invalid_url' })
    await userService.updateInfo(ctx.session!.user.id!, body.info as any)
  }
  ctx.status = 200
}

/**
 * 发送邮箱验证邮件
 */
export async function postEmail(ctx: Context): Promise<void> {
  const body = _.pick<User.Email.POST.RequestBody>(ctx.request.body, ['operator', 'captcha', 'email'])
  assert.v({ data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' })
  assert.v({ data: body.captcha, type: 'string', minLength: 4, maxLength: 4, message: 'invalid_captcha' })
  assert.v({ data: body.email, type: 'string', regExp: emailExp, maxLength: 64, message: 'invalid_email' })

  verify.checkCaptcha(ctx, body.captcha!)
  switch (body.operator) {
    case 'register': {
      assert((await userService.getUserNameByEmail(body.email!)) === null, 'exist_user')
      await verify.sendEmailCode(ctx, body.operator, body.email!)
      break
    }
    case 'reset': {
      const name = await userService.getUserNameByEmail(body.email!)
      assert(name, 'not_exist_user')
      await verify.sendEmailCode(ctx, body.operator, body.email!, name!)
      break
    }
    case 'update': {
      verify.checkLoginState(ctx)
      const user = await userService.getInfo(ctx.session!.user.id!)
      assert(user.email !== body.email!.toLowerCase(), 'same_email')
      await verify.sendEmailCode(ctx, body.operator, body.email!, name)
      break
    }
  }
  ctx.status = 201
}

/**
 * 验证邮箱
 */
export async function putEmail(ctx: Context): Promise<void> {
  const body = _.pick<User.Email.PUT.RequestBody>(ctx.request.body, ['operator', 'code', 'password'])
  assert.v({ data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' })
  assert.v({ data: body.code, type: 'string', minLength: 6, maxLength: 6, message: 'invalid_code' })
  assert.v({ data: body.password, require: false, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })

  verify.checkEmailCode(ctx, body.code!, body.operator!)
  switch (body.operator) {
    case 'register': {
      ctx.session!.user.register = 'email'
      break
    }
    case 'reset': {
      await userService.resetPassword({ email: ctx.session!.verify.email! }, body.password!)
      break
    }
    case 'update': {
      verify.checkLoginState(ctx)
      await userService.updateEmailOrPhone(ctx.session!.user.id!, { email: ctx.session!.verify.email! })
      break
    }
  }
  ctx.status = 200
}

/**
 * 发送手机验证短信, 目前固定验证码为`123456`
 */
export async function postPhone(ctx: Context): Promise<void> {
  const body = _.pick<User.Phone.POST.RequestBody>(ctx.request.body, ['operator', 'captcha', 'phone'])
  assert.v({ data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' })
  assert.v({ data: body.captcha, type: 'string', minLength: 4, maxLength: 4, message: 'invalid_captcha' })
  assert.v({ data: body.phone, type: 'string', regExp: phoneExp, message: 'invalid_phone' })

  verify.checkCaptcha(ctx, body.captcha!)
  switch (body.operator) {
    case 'register': {
      assert((await userService.getUserNameByPhone(body.phone!)) === null, 'exist_user')
      await verify.sendPhoneCode(ctx, body.operator, body.phone!)
      break
    }
    case 'reset': {
      const name = await userService.getUserNameByPhone(body.phone!)
      assert(name, 'not_exist_user')
      await verify.sendPhoneCode(ctx, body.operator, body.phone!, name!)
      break
    }
    case 'update': {
      verify.checkLoginState(ctx)
      const user = await userService.getInfo(ctx.session!.user.id!)
      assert(user.phone !== body.phone!.replace('+86', ''), 'same_phone')
      await verify.sendPhoneCode(ctx, body.operator, body.phone!, name)
      break
    }
  }
  ctx.status = 201
}

/**
 * 验证手机
 */
export async function putPhone(ctx: Context): Promise<void> {
  const body = _.pick<User.Phone.PUT.RequestBody>(ctx.request.body, ['operator', 'code', 'password'])
  assert.v({ data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' })
  assert.v({ data: body.code, type: 'string', minLength: 6, maxLength: 6, message: 'invalid_code' })
  assert.v({ data: body.password, require: false, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })

  verify.checkPhoneCode(ctx, body.code!, body.operator!)
  switch (body.operator) {
    case 'register': {
      ctx.session!.user.register = 'phone'
      break
    }
    case 'reset': {
      await userService.resetPassword({ phone: ctx.session!.verify.phone! }, body.password!)
      break
    }
    case 'update': {
      verify.checkLoginState(ctx)
      await userService.updateEmailOrPhone(ctx.session!.user.id!, { phone: ctx.session!.verify.phone! })
      break
    }
  }
  ctx.status = 200
}

/**
 * 用户登陆
 */
export async function postSession(ctx: Context): Promise<void> {
  const body = _.pick<User.Session.POST.RequestBody>(ctx.request.body, ['user', 'password', 'remember'])
  assert.v({ data: body.user, type: 'string', message: 'invalid_user' })
  assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
  body.remember = body.remember === true

  let userId
  if (body.user!.indexOf('@') !== -1) {
    assert.v({ data: body.user, type: 'string', maxLength: 64, regExp: emailExp, message: 'invalid_email' })
    userId = await userService.login({ email: body.user! }, body.password!)
  } else if (body.user![0] >= '0' && body.user![0] <= '9') {
    assert.v({ data: body.user, type: 'string', minLength: 11, maxLength: 11, message: 'invalid_phone' })
    userId = await userService.login({ phone: body.user! }, body.password!)
  } else {
    assert.v({ data: body.user, type: 'string', regExp: nameExp, message: 'invalid_name' })
    userId = await userService.login({ name: body.user! }, body.password!)
  }

  ctx.session!.user.id = userId
  ctx.session!.user.time = Date.now()
  ctx.session!.user.remember = body.remember
  ctx.status = 201
}

/**
 * 用户登出
 */
export async function deleteSession(ctx: Context): Promise<void> {
  ctx.session = null
  ctx.status = 204
}
