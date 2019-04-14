import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as verify from '../../lib/verify'
import { Context } from '../../types/context'
import * as appService from '../service/app'

const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/
const urlExp = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

/**
 * 创建应用
 */
export async function post(ctx: Context): Promise<void> {
  await verify.requireMinUserLevel(ctx, 1)

  const body = _.pick(ctx.request.body, ['avatar', 'callback_url', 'description', 'home_url', 'name', 'owner', 'type'])
  assert.v(
    { data: body.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' },
    { data: body.callback_url, type: 'string', regExp: urlExp, maxLength: 128, message: 'invalid_callback_url' },
    { data: body.description, type: 'string', maxLength: 256, message: 'invalid_description' },
    { data: body.home_url, type: 'string', regExp: urlExp, maxLength: 128, message: 'invalid_home_url' },
    { data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' },
    { data: body.owner, type: 'string', regExp: nameExp, message: 'invalid_owner' },
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
