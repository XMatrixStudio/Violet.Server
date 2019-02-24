import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as verify from '../../lib/verify'
import * as userService from '../service/user'

export async function postUsers(ctx: Context): Promise<void> {
  const body = _.pick<Classes.Users.POST.RequestBody>(ctx.request.body, ['class', 'reason'])
  assert.v({ data: body.class, type: 'number', message: 'invalid_class' })
  assert.v({ data: body.reason, type: 'string', maxLength: 256, message: 'invalid_reason' })

  ctx.status = 201
}
