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

  const body = _.pick<PostApps.ReqBody>(ctx.request.body, [
    'avatar',
    'callbackHosts',
    'description',
    'displayName',
    'name',
    'owner',
    'type',
    'url'
  ])
  assert.v(
    { data: body.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' },
    { data: body.callbackHosts, type: 'string-array', message: 'invalid_callback_hosts' },
    { data: body.description, type: 'string', maxLength: 256, message: 'invalid_description' },
    { data: body.displayName, type: 'string', maxLength: 32, message: 'invalid_display_name' },
    { data: body.name, type: 'string', regExp: regexp.Name, message: 'invalid_name' },
    { data: body.owner, type: 'string', regExp: regexp.Name, message: 'invalid_owner' },
    { data: body.type, type: 'number', message: 'invalid_type' },
    { data: body.url, type: 'string', regExp: regexp.Url, maxLength: 128, message: 'invalid_url' }
  )
  // for (const host of body.callbackHosts!) {
  //   assert.v({ data: host, type: 'string', regExp: regexp.Url, message: 'invalid_callback_hosts' })
  // }
  await appService.createApp(
    ctx.session!.user.id!,
    body.name!,
    body.displayName!,
    body.owner!,
    body.description!,
    body.type!,
    body.url!,
    body.callbackHosts as string[],
    body.avatar
  )
  ctx.status = 201
}

export async function getByExtId(ctx: Context) {
  const body = _.pick<GetAppsByExtId.Query>(ctx.request.query, ['all'])
  body.all = body.all === 'true' || body.all === ''
  assert.v({ data: ctx.params.extId, type: 'string', regExp: regexp.ExtId, message: 'invalid_ext_id' })
  if (body.all) ctx.body = await appService.getAllInfo(ctx.session!.user.id!, ctx.params.extId)
  else ctx.body = await appService.getBaseInfo(ctx.params.extId)
  ctx.status = 200
}

export async function patchById(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)
  const body = _.pick<PatchAppsById.ReqBody>(ctx.request.body, [
    'avatar',
    'callbackHosts',
    'description',
    'displayName',
    'keyUpdate',
    'state',
    'type',
    'url'
  ])
  body.keyUpdate = body.keyUpdate === true
  assert.v(
    { data: ctx.params.id, type: 'string', regExp: regexp.Id, message: 'invalid_id' },
    { data: body.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' },
    { data: body.callbackHosts, require: false, type: 'string-array', message: 'invalid_callback_hosts' },
    { data: body.description, require: false, type: 'string', maxLength: 256, message: 'invalid_description' },
    { data: body.displayName, require: false, type: 'string', maxLength: 32, message: 'invalid_display_name' },
    { data: body.state, require: false, type: 'number', enums: [0, 1], message: 'invalid_state' },
    { data: body.type, require: false, type: 'number', message: 'invalid_type' },
    { data: body.url, require: false, type: 'string', regExp: regexp.Url, maxLength: 128, message: 'invalid_url' }
  )
  // TODO: callbackHosts check
  await appService.updateInfo(
    ctx.session!.user.id!,
    ctx.params.id,
    body.keyUpdate,
    {
      avatar: body.avatar,
      description: body.description,
      displayName: body.displayName,
      url: body.url
    },
    body.state,
    body.type,
    body.callbackHosts as string[]
  )
  ctx.status = 200
}
