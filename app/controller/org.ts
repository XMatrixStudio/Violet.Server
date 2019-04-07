import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as verify from '../../lib/verify'
import { Context } from '../../types/context'
import * as orgService from '../service/org'

const emailExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
const nameExp = /^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/
const phoneExp = /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[01356789]\d{2}|4(?:0\d|1[0-2]|9\d))|9[189]\d{2}|6[567]\d{2}|4[579]\d{2})\d{6}$/

/**
 * 创建组织
 */
export async function post(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)

  const body = _.pick<Orgs.POST.RequestBody>(ctx.request.body, ['name', 'description', 'contact', 'email', 'phone'])
  assert.v({ data: body.name, type: 'string', regExp: nameExp, message: 'invalid_name' })
  assert.v({ data: body.description, type: 'string', maxLength: 128, message: 'invalid_description' })
  assert.v({ data: body.contact, type: 'string', maxLength: 32, message: 'invalid_person' })
  assert.v({ data: body.email, type: 'string', regExp: emailExp, maxLength: 64, message: 'invalid_email' })
  assert.v({ data: body.phone, type: 'string', regExp: phoneExp, message: 'invalid_phone' })

  await orgService.createOrganization(ctx.session!.user.id!, body.name!, body.description!, body.contact!, body.email!, body.phone!)
  ctx.status = 201
}
