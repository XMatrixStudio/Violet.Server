import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as levelService from '../service/level'

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
    assert(ctx.session!.user.level! >= 50, 'permission_deny')
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

  assert(ctx.session!.user.level! >= 0 || ctx.session!.user.level === -1 - body.level!, 'ban_user', 403)
  assert(ctx.session!.user.level !== body.level, 'now_level')
  await levelService.requestUpdateUserLevel(ctx.session!.user.id!, body.level!, body.reason!)
  ctx.status = 201
}
