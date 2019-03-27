import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as store from '../../lib/store'
import { Context } from '../../types/context'
import * as orgService from '../service/org'

const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/

/**
 * 创建组织
 */
export async function post(ctx: Context) {
  assert((await store.getUserLevelById(ctx.session!.user.id!)) >= 1, 'permission_deny', 403)
  const body = _.pick(ctx.request.body, ['name'])
  assert.v({ data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' })

  await orgService.createOrganization(ctx.session!.user.id!, body.name)
  ctx.status = 201
}
