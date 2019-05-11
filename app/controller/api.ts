import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import { Context } from '../../types/context'

export async function getUsersInfo(ctx: Context) {}

export async function postVerifyPassword(ctx: Context) {}

export async function postVerifyToken(ctx: Context) {
  const body = _.pick<PostVerifyToken.ReqBody>(ctx.request.body, ['appSecret', 'code', 'grantType', 'state'])
  assert.v(
    { data: body.appSecret, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_app_secret' },
    { data: body.code, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_code' },
    { data: body.grantType, type: 'string', enums: ['authorization_code'], message: 'invalid_grant_type' },
    { data: body.state, type: 'string', maxLength: 128, message: 'invalid_state' }
  )

}
