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

export async function getByExtId(ctx: Context) {
  const body = _.pick<GetOrgsByExtId.Query>(ctx.request.query, ['all'])
  body.all = body.all === 'true' || body.all === ''
  assert.v({ data: ctx.params.extId, type: 'string', regExp: regexp.ExtId, message: 'invalid_ext_id' })
  if (body.all) ctx.body = await orgService.getAllInfo(ctx.session!.user.id!, ctx.params.extId)
  else ctx.body = await orgService.getInfo(ctx.params.extId)
  ctx.status = 200
}

export async function getByIdApps(ctx: Context) {
  const body = _.pick<GetOrgsByIdApps.Query>(ctx.request.query, ['page', 'limit'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : 1
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : 10
  assert.v({ data: ctx.params.id, type: 'string', regExp: regexp.Id, message: 'invalid_id' })
  ctx.body = await orgService.getAppBaseInfoList(ctx.params.id, body.page, body.limit)
  ctx.status = 200
}

export async function getByIdMembers(ctx: Context) {
  const body = _.pick<GetOrgsByIdMembers.Query>(ctx.request.query, ['page', 'limit'])
  body.page = typeof body.page === 'string' ? parseInt(body.page) : 1
  body.limit = typeof body.limit === 'string' ? parseInt(body.limit) : 10
  assert.v({ data: ctx.params.id, type: 'string', regExp: regexp.Id, message: 'invalid_id' })
  ctx.body = await orgService.getMembers(ctx.params.id, body.page, body.limit)
  ctx.status = 200
}

export async function postByIdMembers(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)
  const body = _.pick<PostOrgsByIdMembers.ReqBody>(ctx.request.body, ['userId'])
  assert.v(
    { data: ctx.params.id, type: 'string', regExp: regexp.Id, message: 'invalid_id' },
    { data: body.userId, type: 'string', regExp: regexp.Id, message: 'invalid_user_id' }
  )
  await orgService.addMember(ctx.session!.user.id!, ctx.params.id, body.userId!)
  ctx.status = 201
}

export async function putByIdMembers(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)
  const body = _.pick<PutOrgsByIdMembers.ReqBody>(ctx.request.body, ['userId', 'role'])
  assert.v(
    { data: ctx.params.id, type: 'string', regExp: regexp.Id, message: 'invalid_id' },
    { data: body.userId, type: 'string', regExp: regexp.Id, message: 'invalid_user_id' },
    { data: body.role, type: 'number', enums: [0, 1], message: 'invalid_role' }
  )
  await orgService.updateMemberRole(ctx.session!.user.id!, ctx.params.id, body.userId!, body.role!)
  ctx.status = 200
}

export async function deleteByIdMembersByUserId(ctx: Context) {
  await verify.requireMinUserLevel(ctx, 1)
  assert.v(
    { data: ctx.params.id, type: 'string', regExp: regexp.Id, message: 'invalid_id' },
    { data: ctx.params.userId, type: 'string', regExp: regexp.Id, message: 'invalid_user_id' }
  )
  await orgService.removeMember(ctx.session!.user.id!, ctx.params.id, ctx.params.userId)
  ctx.status = 204
}
