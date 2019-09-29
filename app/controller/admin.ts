import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as verify from '../../lib/verify'
import { Context } from '../../types/context'
import * as adminService from '../service/admin'

export async function getRequests(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 50)

  const body = _.pick<Admin.Requests.GET.Query>(ctx.request.query, ['page', 'limit', 'state', 'type'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : undefined
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : undefined
  body.state = typeof body.state === 'string' ? parseInt(body.state) : undefined
  body.type = typeof body.type === 'string' ? parseInt(body.type) : undefined
  assert.v({ data: body.page, type: 'positive', message: 'invalid_page' })
  assert.v({ data: body.limit, type: 'positive', message: 'invalid_limit' })
  assert.v({ data: body.state, require: false, type: 'number', min: 0, max: 3, message: 'invalid_state' })
  assert.v({ data: body.type, require: false, type: 'number', enums: [0, 1, 10, 11, 20], message: 'invalid_type' })

  ctx.body = await adminService.getRequests(body.page!, body.limit!, body.type, body.state)
  ctx.status = 201
}
