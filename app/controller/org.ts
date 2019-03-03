import { Context } from 'koa'
import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as verify from '../../lib/verify'

const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/

/**
 * 创建组织
 */
export async function post(ctx: Context) {
  const body = _.pick(ctx.request.body, ['name'])
  assert.v({ data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' })

  ctx.status = 201
}
