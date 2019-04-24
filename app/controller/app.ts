import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as regexp from '../../lib/regexp'
import * as verify from '../../lib/verify'
import { Context } from '../../types/context'
import * as appService from '../service/app'

/**
 * 创建应用
 */
export async function post(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)

  const body = _.pick<PostApps.ReqBody>(ctx.request.body, ['avatar', 'callbackUrl', 'description', 'homeUrl', 'name', 'owner', 'type'])
  assert.v(
    { data: body.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' },
    { data: body.callbackUrl, type: 'string', regExp: regexp.Url, maxLength: 128, message: 'invalid_callback_url' },
    { data: body.description, type: 'string', maxLength: 256, message: 'invalid_description' },
    { data: body.homeUrl, type: 'string', regExp: regexp.Url, maxLength: 128, message: 'invalid_home_url' },
    { data: body.name, type: 'string', regExp: regexp.Name, message: 'invalid_name' },
    { data: body.owner, type: 'string', regExp: regexp.Name, message: 'invalid_owner' },
    { data: body.type, type: 'number', message: 'invalid_type' }
  )
  await appService.createApp(
    ctx.session!.user.id!,
    body.name!,
    body.owner!,
    body.description!,
    body.type!,
    body.homeUrl!,
    body.callbackUrl!,
    body.avatar
  )
  ctx.status = 201
}

/**
 * 获取指定`name`或`id`的应用信息
 */
export async function getByNameOrId(ctx: Context) {
  const body = _.pick<GetAppsByNameOrId.Query>(ctx.request.query, ['all'])
  body.all = body.all === true
  assert(ctx.params.nameOrId && ctx.params.nameOrId.length !== 0, 'invalid_name')
  if (ctx.params.nameOrId[0] !== '+') {
    assert.v({ data: ctx.params.nameOrId, type: 'string', regExp: regexp.Name, message: 'invalid_name' })
    ctx.body = await appService.getAppBaseInfo({ name: ctx.params.nameOrId })
  } else {
    assert.v({ data: ctx.params.nameOrId, type: 'string', regExp: regexp.ExtId, message: 'invalid_id' })
    ctx.body = await appService.getAppBaseInfo({ id: ctx.params.nameOrId.substr(1) })
  }
  ctx.status = 200
}
