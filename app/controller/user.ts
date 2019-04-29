import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as regexp from '../../lib/regexp'
import * as verify from '../../lib/verify'
import { Context } from '../../types/context'
import * as userService from '../service/user'

/**
 * 注册用户
 */
export async function post(ctx: Context) {
  const body = _.pick<PostUsers.ReqBody>(ctx.request.body, ['name', 'nickname', 'password'])
  assert.v(
    { data: body.name, type: 'string', regExp: regexp.Name, message: 'invalid_name' },
    { data: body.nickname, require: false, type: 'string', maxLength: 32, message: 'invalid_nickname' },
    { data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' }
  )
  body.nickname = body.nickname || body.name!

  assert(ctx.session!.user.register, 'not_exist_register_record')
  switch (ctx.session!.user.register) {
    case 'email':
      await userService.register(ctx.session!.verify.email!, '', body.name!, body.nickname, body.password!)
      break
    case 'phone':
      await userService.register('', ctx.session!.verify.phone!, body.name!, body.nickname, body.password!)
      break
  }
  ctx.session!.user.register = undefined
  ctx.status = 201
}

/**
 * 修改用户个人信息
 */
export async function patch(ctx: Context) {
  const body = _.pick<PatchUsers.ReqBody>(ctx.request.body, ['secure', 'info'])
  if (body.secure) {
    body.secure = _.pick(body.secure, ['new_password', 'old_password'])
    assert.v(
      { data: body.secure.newPassword, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_new_password' },
      { data: body.secure.oldPassword, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_old_password' }
    )
    await userService.updatePassword(ctx.session!.user.id!, body.secure.oldPassword!, body.secure.newPassword!)
  }
  if (body.info && !_.isEmpty(body.info)) {
    body.info = _.pick(body.info, ['avatar', 'bio', 'birthday', 'email', 'gender', 'location', 'nickname', 'phone', 'url'])
    if (body.info.birthday) body.info.birthday = new Date(body.info.birthday as string)
    assert.v(
      { data: body.info.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' },
      { data: body.info.bio, require: false, type: 'string', maxLength: 128, message: 'invalid_bio' },
      { data: body.info.birthday, require: false, type: 'past', message: 'invalid_birthday' },
      { data: body.info.email, require: false, type: 'string', regExp: regexp.Email, maxLength: 64, message: 'invalid_email' },
      { data: body.info.gender, require: false, type: 'number', enums: [0, 1, 2], message: 'invalid_gender' },
      { data: body.info.location, require: false, type: 'string', maxLength: 64, message: 'invalid_location' },
      { data: body.info.nickname, require: false, type: 'string', maxLength: 32, message: 'invalid_nickname' },
      { data: body.info.phone, require: false, type: 'string', message: 'invalid_phone' },
      { data: body.info.url, require: false, type: 'string', regExp: regexp.Url, maxLength: 128, message: 'invalid_url' }
    )
    await userService.updateInfo(ctx.session!.user.id!, body.info as any)
  }
  ctx.status = 200
}

/**
 * 获取用户信息
 */
export async function getByName(ctx: Context) {
  if (ctx.params.name === 'me') {
    await verify.requireLogin(ctx)
    ctx.body = await userService.getAllInfo(ctx.session!.user.id!)
  } else {
    ctx.body = await userService.getBaseInfo(ctx.params.name)
  }
  ctx.status = 200
}

/**
 * 获取指定用户名`name`的应用列表，当`name`为`me`时指定当前用户
 */
export async function getByNameApps(ctx: Context) {
  const body = _.pick<GetUsersByNameApps.Query>(ctx.request.query, ['page', 'limit'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : 1
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : 10

  if (ctx.params.name === 'me') {
    await verify.requireLogin(ctx)
    ctx.body = await userService.getAppBaseInfoList({ id: ctx.session!.user.id! }, body.page, body.limit)
  } else {
    ctx.body = await userService.getAppBaseInfoList({ name: ctx.params.name }, body.page, body.limit)
  }
  ctx.status = 200
}

/**
 * 获取指定用户名`name`的组织列表，当`name`为`me`时指定当前用户
 */
export async function getByNameOrgs(ctx: Context) {
  const body = _.pick<GetUsersByNameOrgs.Query>(ctx.request.query, ['page', 'limit'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : 1
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : 10

  if (ctx.params.name === 'me') {
    await verify.requireLogin(ctx)
    ctx.body = await userService.getOrgBaseInfoList({ id: ctx.session!.user.id! }, body.page, body.limit)
  } else {
    ctx.body = await userService.getOrgBaseInfoList({ name: ctx.params.name }, body.page, body.limit)
  }
  ctx.status = 200
}

export async function getAuths(ctx: Context) {
  const body = _.pick(ctx.request.query, ['page', 'limit'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : 1
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : 10
  ctx.body = await userService.getAuths(ctx.session!.user.id!, body.page, body.limit)
  ctx.status = 200
}

export async function postAuths(ctx: Context) {
  const body = _.pick<PostUsersAuths.ReqBody>(ctx.request.body, ['appId', 'duration', 'scope'])
  assert.v(
    { data: body.appId, type: 'string', regExp: regexp.Id, message: 'invalid_app_id' },
    { data: body.duration, type: 'number', enums: [0, 1, 7, 15, 30, 90], message: 'invalid_duration' },
    { data: body.scope, type: 'string-array', message: 'invalid_scope' }
  )
  body.scope = _.uniq(body.scope)
  let base = false
  for (const s of body.scope!) {
    assert.v({ data: s, type: 'string', enums: ['base', 'info', 'email'], message: 'invalid_scope' })
    if (s === 'base') base = true
  }
  assert(base, 'invalid_scope')
  await userService.auth(ctx.session!.user.id!, body.appId!, body.duration!, body.scope as string[])
  ctx.status = 201
}

export async function deleteAuths(ctx: Context) {
  const body = _.pick(ctx.request.body, ['app'])
  assert.v({ data: body.app, type: 'string', regExp: regexp.Name, message: 'invalid_app' })
  await userService.removeAuth(ctx.session!.user.id!, body.app)
  ctx.status = 204
}

export async function getAuthsByApp(ctx: Context) {
  assert.v({ data: ctx.params.app, type: 'string', regExp: regexp.Name, message: 'invalid_app' })
  ctx.body = await userService.getAuth(ctx.session!.user.id!, ctx.params.app)
  ctx.status = 200
}

export async function putDev(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)

  const body = _.pick<PutUsersDev.ReqBody>(ctx.request.body, ['email', 'name', 'phone'])
  assert.v(
    { data: body.email, type: 'string', regExp: regexp.Email, maxLength: 64, message: 'invalid_email' },
    { data: body.name, type: 'string', maxLength: 32, message: 'invalid_name' },
    { data: body.phone, type: 'string', maxLength: 32, message: 'invalid_phone' }
  )
  await userService.updateDevInfo(ctx.session!.user.id!, body.name!, body.email!, body.phone!)
  ctx.status = 200
}

/**
 * 发送邮箱验证邮件
 */
export async function postEmail(ctx: Context) {
  const body = _.pick<PostUsersEmail.ReqBody>(ctx.request.body, ['operator', 'captcha', 'email'])
  assert.v(
    { data: body.captcha, type: 'string', minLength: 4, maxLength: 4, message: 'invalid_captcha' },
    { data: body.email, type: 'string', regExp: regexp.Email, maxLength: 64, message: 'invalid_email' },
    { data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' }
  )

  verify.checkCaptcha(ctx, body.captcha!)
  if (body.operator === 'update') await verify.requireLogin(ctx)
  const code = verify.getEmailCode(ctx, body.email!, body.operator!)
  await userService.sendEmailCode(ctx.session!.user.id!, body.email!, body.operator!, code)
  ctx.status = 201
}

/**
 * 验证邮箱
 */
export async function putEmail(ctx: Context) {
  const body = _.pick<PutUsersEmail.ReqBody>(ctx.request.body, ['operator', 'code', 'password'])
  assert.v(
    { data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' },
    { data: body.code, type: 'string', minLength: 6, maxLength: 6, message: 'invalid_code' }
  )

  switch (body.operator) {
    case 'register':
      verify.checkEmailCode(ctx, body.code!, body.operator!)
      ctx.session!.user.register = 'email'
      break
    case 'reset':
      assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
      verify.checkEmailCode(ctx, body.code!, body.operator!)
      await userService.resetPassword({ email: ctx.session!.verify.email! }, body.password!)
      break
    case 'update':
      verify.checkLoginState(ctx)
      assert.v({ data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })
      await userService.checkPassword(ctx.session!.user.id!, body.password!)
      verify.checkEmailCode(ctx, body.code!, body.operator!)
      await userService.updateEmailOrPhone(ctx.session!.user.id!, { email: ctx.session!.verify.email! })
      break
  }
  ctx.status = 200
}

/**
 * 发送手机验证短信, 目前固定验证码为`123456`
 */
export async function postPhone(ctx: Context) {
  assert(false, 'not_implement')
  const body = _.pick<PostUsersPhone.ReqBody>(ctx.request.body, ['operator', 'captcha', 'phone'])
  assert.v({ data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' })
  assert.v({ data: body.captcha, type: 'string', minLength: 4, maxLength: 4, message: 'invalid_captcha' })
  assert.v({ data: body.phone, type: 'string', regExp: regexp.Phone, message: 'invalid_phone' })

  verify.checkCaptcha(ctx, body.captcha!)
  switch (body.operator) {
    case 'register':
      // assert((await userService.getUserNameByPhone(body.phone!)) === null, 'exist_user')
      await verify.sendPhoneCode(ctx, body.operator, body.phone!)
      break
    case 'reset':
      // const name = await userService.getUserNameByPhone(body.phone!)
      assert(name, 'not_exist_user')
      await verify.sendPhoneCode(ctx, body.operator, body.phone!, name!)
      break
    case 'update':
      verify.checkLoginState(ctx)
      const user = await userService.getAllInfo(ctx.session!.user.id!)
      assert(user.phone !== body.phone!.replace('+86', ''), 'same_phone')
      await verify.sendPhoneCode(ctx, body.operator, body.phone!, user.info.nickname)
      break
  }
  ctx.status = 201
}

/**
 * 验证手机
 */
export async function putPhone(ctx: Context) {
  const body = _.pick<PutUsersPhone.ReqBody>(ctx.request.body, ['operator', 'code', 'password'])
  assert.v({ data: body.operator, type: 'string', enums: ['register', 'reset', 'update'], message: 'invalid_operator' })
  assert.v({ data: body.code, type: 'string', minLength: 6, maxLength: 6, message: 'invalid_code' })
  assert.v({ data: body.password, require: false, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' })

  verify.checkPhoneCode(ctx, body.code!, body.operator!)
  switch (body.operator) {
    case 'register':
      ctx.session!.user.register = 'phone'
      break
    case 'reset':
      await userService.resetPassword({ phone: ctx.session!.verify.phone! }, body.password!)
      break
    case 'update':
      verify.checkLoginState(ctx)
      await userService.updateEmailOrPhone(ctx.session!.user.id!, { phone: ctx.session!.verify.phone! })
      break
  }
  ctx.status = 200
}

export async function getRequests(ctx: Context) {
  ctx.body = await userService.getRequestList(ctx.session!.user.id!)
  ctx.status = 200
}

/**
 * 申请更改用户等级
 */
export async function postRequestsLevels(ctx: Context) {
  const body = _.pick<PostUsersRequestsLevels.ReqBody>(ctx.request.body, ['level', 'name', 'email', 'phone', 'remark'])
  assert.v(
    { data: body.level, type: 'number', enums: [1, 50, 99], message: 'invalid_level' },
    { data: body.remark, require: false, type: 'string', maxLength: 256, message: 'invalid_remark' }
  )
  if (body.level === 1) {
    await verify.requireUserLevel(ctx, 0)
    assert.v(
      { data: body.email, type: 'string', regExp: regexp.Email, maxLength: 64, message: 'invalid_email' },
      { data: body.name, type: 'string', maxLength: 32, message: 'invalid_name' },
      { data: body.phone, type: 'string', maxLength: 32, message: 'invalid_phone' }
    )
  } else {
    if (body.level === 50) await verify.requireUserLevel(ctx, 1)
    else await verify.requireMinUserLevel(ctx, 1)
    assert.v(
      { data: body.email, require: false, type: 'string', regExp: regexp.Email, maxLength: 64, message: 'invalid_email' },
      { data: body.name, require: false, type: 'string', maxLength: 32, message: 'invalid_name' },
      { data: body.phone, require: false, type: 'string', maxLength: 32, message: 'invalid_phone' }
    )
  }

  await userService.updateLevel(ctx.session!.user.id!, body.level!, body.remark, body.name, body.email, body.phone)
  ctx.status = 201
}

export async function postRequestsApps(ctx: Context) {
  const body = _.pick<PostUsersRequestsApps.ReqBody>(ctx.request.body, ['remark'])
  assert.v({ data: body.remark, type: 'string', maxLength: 256, message: 'invalid_remark' })

  await userService.updateDevLimit(ctx.session!.user.id!, 'app', body.remark!)
  ctx.status = 201
}

export async function postRequestsOrgs(ctx: Context) {
  const body = _.pick<PostUsersRequestsOrgs.ReqBody>(ctx.request.body, ['remark'])
  assert.v({ data: body.remark, type: 'string', maxLength: 256, message: 'invalid_remark' })

  await userService.updateDevLimit(ctx.session!.user.id!, 'org', body.remark!)
  ctx.status = 201
}

/**
 * 用户登陆
 */
export async function postSession(ctx: Context) {
  const body = _.pick<PostUsersSession.ReqBody>(ctx.request.body, ['user', 'password', 'remember'])
  assert.v(
    { data: body.user, type: 'string', message: 'invalid_user' },
    { data: body.password, type: 'string', minLength: 128, maxLength: 128, message: 'invalid_password' }
  )
  body.remember = body.remember === true

  let userId
  if (body.user!.indexOf('@') !== -1) {
    assert.v({ data: body.user, type: 'string', maxLength: 64, regExp: regexp.Email, message: 'invalid_email' })
    userId = await userService.login({ email: body.user! }, body.password!, ctx.request.ip)
  } else if (body.user![0] >= '0' && body.user![0] <= '9') {
    assert.v({ data: body.user, type: 'string', regExp: regexp.Phone, message: 'invalid_phone' })
    userId = await userService.login({ phone: body.user! }, body.password!, ctx.request.ip)
  } else {
    assert.v({ data: body.user, type: 'string', regExp: regexp.Name, message: 'invalid_name' })
    userId = await userService.login({ name: body.user! }, body.password!, ctx.request.ip)
  }

  ctx.session!.user.id = userId
  ctx.session!.user.time = Date.now()
  ctx.session!.user.remember = body.remember
  ctx.status = 201
}

/**
 * 用户登出
 */
export async function deleteSession(ctx: Context) {
  ctx.session = null
  ctx.status = 204
}
