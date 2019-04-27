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

  const body = _.pick<PostOrgs.ReqBody>(ctx.request.body, ['avatar', 'contact', 'description', 'displayName', 'email', 'name', 'phone'])
  assert.v(
    { data: body.avatar, require: false, type: 'string', maxLength: 102400, message: 'invalid_avatar' },
    { data: body.contact, type: 'string', maxLength: 32, message: 'invalid_contact' },
    { data: body.description, type: 'string', maxLength: 128, message: 'invalid_description' },
    { data: body.displayName, type: 'string', maxLength: 32, message: 'invalid_name' },
    { data: body.email, type: 'string', regExp: regexp.Email, maxLength: 64, message: 'invalid_email' },
    { data: body.name, type: 'string', regExp: regexp.Name, message: 'invalid_name' },
    { data: body.phone, type: 'string', maxLength: 32, message: 'invalid_phone' }
  )

  await orgService.createOrg(
    ctx.session!.user.id!,
    body.name!,
    body.displayName!,
    body.description!,
    body.contact!,
    body.email!,
    body.phone!,
    body.avatar
  )
  ctx.status = 201
}

/**
 * 获取指定组织名`name`的应用列表
 */
export async function getByNameApps(ctx: Context) {
  const body = _.pick<GetOrgsByNameApps.Query>(ctx.request.query, ['page', 'limit'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : 1
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : 10

  ctx.body = await orgService.getAppBaseInfoList(ctx.params.name, body.page, body.limit)
  ctx.status = 200
}

export async function postByNameMembers(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)
  const body = _.pick<PostOrgsByNameMembers.ReqBody>(ctx.request.body, ['user'])
  assert.v({ data: body.user, type: 'string', regExp: regexp.Name, message: 'invalid_user' })
  await orgService.addMember(ctx.session!.user.id!, ctx.params.name, body.user!)
  ctx.status = 201
}
