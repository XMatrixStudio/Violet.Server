import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as regexp from '../../lib/regexp'
import * as verify from '../../lib/verify'
import { Context } from '../../types/context'
import * as orgService from '../service/org'

/**
 * 创建组织
 */
export async function post(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)

  const body = _.pick(ctx.request.body, ['name', 'description', 'contact', 'email', 'phone'])
  assert.v({ data: body.name, type: 'string', regExp: regexp.Name, message: 'invalid_name' })
  assert.v({ data: body.description, type: 'string', maxLength: 128, message: 'invalid_description' })
  assert.v({ data: body.contact, type: 'string', maxLength: 32, message: 'invalid_contact' })
  assert.v({ data: body.email, type: 'string', regExp: regexp.Email, maxLength: 64, message: 'invalid_email' })
  assert.v({ data: body.phone, type: 'string', regExp: regexp.Phone, message: 'invalid_phone' })

  await orgService.createOrg(ctx.session!.user.id!, body.name, body.description, body.contact, body.email, body.phone)
  ctx.status = 201
}
