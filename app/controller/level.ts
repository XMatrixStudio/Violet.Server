import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as store from '../../lib/store'
import * as levelService from '../service/level'
import * as verify from '../../lib/verify'
import { Context } from '../../types/context'

/**
 * 获取用户等级列表
 */
export async function get(ctx: Context): Promise<void> {
  ctx.body = await levelService.getLevels()
  ctx.status = 200
}

/**
 * 创建用户等级
 */
export async function post(ctx: Context): Promise<void> {
  const body = _.pick<Levels.POST.RequestBody>(ctx.request.body, ['level', 'app', 'org', 'auto_pass', 'request_access'])
  assert.v({ data: body.level, type: 'number', min: 1, max: 98, message: 'invalid_level' })
  assert.v({ data: body.app, type: 'number', min: -1, message: 'invalid_app' })
  assert.v({ data: body.org, type: 'number', min: -1, message: 'invalid_org' })
  assert.v({ data: body.auto_pass, type: 'boolean', message: 'invalid_auto_pass' })
  assert.v({ data: body.request_access, type: 'boolean', message: 'invalid_request_access' })

  verify.checkLoginState(ctx)
  const level = await store.getUserLevelById(ctx.session!.user.id!)
  assert(level === 99, 'permission_deny', 403)
  await levelService.createLevel(body.level!, body.app!, body.org!, body.auto_pass!, body.request_access!)
  ctx.status = 201
}

/**
 * 获取申请列表
 */
export async function getUsers(ctx: Context): Promise<void> {
  const body = _.pick<Levels.Users.GET.Query>(ctx.request.query, ['page', 'limit', 'state', 'self'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : undefined
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : undefined
  body.state = typeof body.state === 'string' ? parseInt(body.state) : undefined
  assert.v({ data: body.page, type: 'positive', message: 'invalid_page' })
  assert.v({ data: body.limit, type: 'positive', message: 'invalid_limit' })
  assert.v({ data: body.state, require: false, type: 'number', min: 0, max: 3, message: 'invalid_state' })
  body.self = body.self === 'true'

  if (body.self) {
    ctx.body = await levelService.getRequests(ctx.session!.user.id!, body.state, body.page!, body.limit!)
  } else {
    assert((await store.getUserLevelById(ctx.session!.user.id!)) >= 50, 'permission_deny')
    ctx.body = await levelService.getRequests(undefined, body.state, body.page!, body.limit!)
  }
  ctx.status = 201
}

/**
 * 申请修改用户等级
 */
export async function postUsers(ctx: Context): Promise<void> {
  const body = _.pick<Levels.Users.POST.RequestBody>(ctx.request.body, ['level', 'reason'])
  assert.v({ data: body.level, type: 'number', min: -99, max: 99, message: 'invalid_level' })
  assert.v({ data: body.reason, type: 'string', maxLength: 256, message: 'invalid_reason' })

  const level = await store.getUserLevelById(ctx.session!.user.id!)
  assert(level >= 0 || level === -1 - body.level!, 'ban_user', 403)
  assert(level !== body.level, 'now_level')
  await levelService.requestUpdateUserLevel(ctx.session!.user.id!, body.level!, body.reason!)
  ctx.status = 201
}
