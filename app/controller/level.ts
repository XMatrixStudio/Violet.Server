import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as levelService from '../service/level'

/**
 * 获取申请列表
 */
export async function getUsers(ctx: Context): Promise<void> {
  ctx.status = 201
}

/**
 * 申请修改用户等级
 */
export async function postUsers(ctx: Context): Promise<void> {
  const body = _.pick<Classes.Users.POST.RequestBody>(ctx.request.body, ['level', 'reason'])
  assert.v({ data: body.level, type: 'number', min: -99, max: 99, message: 'invalid_level' })
  assert.v({ data: body.reason, type: 'string', maxLength: 256, message: 'invalid_reason' })

  assert(ctx.session!.user.level! >= 0 || ctx.session!.user.level === -1 - body.level!, 'ban_user', 403)
  assert(ctx.session!.user.level !== body.level, 'now_level')
  await levelService.requestUpdateUserLevel(ctx.session!.user.id!, body.level!, body.reason!)
  ctx.status = 201
}
