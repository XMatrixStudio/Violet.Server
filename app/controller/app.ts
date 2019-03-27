import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as store from '../../lib/store'
import { Context } from '../../types/context'

const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/

/**
 * 创建应用
 */
export async function post(ctx: Context): Promise<void> {
  assert((await store.getUserLevelById(ctx.session!.user.id!)) >= 1, 'permission_deny', 403)
  const body = _.pick<Apps.POST.RequestBody>(ctx.request.body, ['owner', 'name', 'description'])
  assert.v({ data: body.owner, type: 'string', regExp: nameExp, message: 'invalid_owner' })
  assert.v({ data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' })
  assert.v({ data: body.description, require: false, type: 'string', maxLength: 256, message: 'invalid_description' })

  ctx.status = 201
}
