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

  const body = _.pick(ctx.request.body, ['avatar', 'callback_url', 'description', 'home_url', 'name', 'owner', 'type'])
  assert.v(
    { data: body.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' },
    { data: body.callback_url, type: 'string', regExp: regexp.Url, maxLength: 128, message: 'invalid_callback_url' },
    { data: body.description, type: 'string', maxLength: 256, message: 'invalid_description' },
    { data: body.home_url, type: 'string', regExp: regexp.Url, maxLength: 128, message: 'invalid_home_url' },
    { data: body.name, type: 'string', regExp: regexp.Name, message: 'invalid_name' },
    { data: body.owner, type: 'string', regExp: regexp.Name, message: 'invalid_owner' },
    { data: body.type, type: 'number', message: 'invalid_type' }
  )
  await appService.createApp(
    ctx.session!.user.id!,
    body.name,
    body.owner,
    body.description,
    body.type,
    body.home_url,
    body.callback_url,
    body.avatar
  )
  ctx.status = 201
}

export async function getById(ctx: Context) {
  const body = _.pick(ctx.request.query, ['all'])
  assert.v({ data: ctx.params.id, type: 'string', regExp: regexp.Name, message: 'invalid_name' })
  body.all = body.all === true
  ctx.body = await appService.getApp(ctx.session!.user.id, ctx.params.id)
  ctx.status
}
