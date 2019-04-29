import * as assert from '../../lib/assert'
import * as file from '../../lib/file'
import * as util from '../../lib/util'
import config from '../config/config'
import * as appModel from '../model/app'
import * as orgModel from '../model/org'
import * as userModel from '../model/user'

export async function addMember(userId: string, orgName: string, memberName: string) {
  const org = await orgModel.getByName(orgName)
  assert(org, 'not_exist_org')
  const permission = await orgModel.getUserPermission(org!._id, userId)
  assert(permission.invite, 'permission_deny', 403)
  const user = await userModel.getByName(memberName)
  assert(user, 'not_exist_user')
  assert(await orgModel.isHasMember(org!._id, user!._id), 'already_member')
  await orgModel.addMember(org!._id, user!._id)
}

/**
 * 创建组织
 * @param {string} userId 用户ObjectId
 * @param {string} name 组织名
 * @param {string} displayName 组织显示名
 * @param {string} description 简介
 * @param {string} contact 联系人
 * @param {string} email 联系邮箱
 * @param {string} phone 联系电话
 * @param {string} avatar 头像Base64串
 */
export async function createOrg(
  userId: string,
  name: string,
  displayName: string,
  description: string,
  contact: string,
  email: string,
  phone: string,
  avatar?: string
) {
  const user = (await userModel.getById(userId))!
  assert(user.dev!.org.limit > user.dev!.org.own, 'limit_orgs')
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(!(await orgModel.getByName(name)) && !(await userModel.getByName(name)), 'exist_name')
  const id = await orgModel.add(userId, name, displayName, description, contact, email, phone)
  await userModel.updateDevState(userId, 'org.own', 1)
  if (avatar) {
    await file.upload(id + '.png', Buffer.from(avatar.replace('data:image/png;base64,', ''), 'base64'))
    await orgModel.setAvatar(id, config!.file.cos.url + id + '.png')
  }
}

export async function getAllInfo(userId: string, extId: string): Promise<GetOrgsByExtId.ResBody> {
  let org: orgModel.IOrg | null
  if (extId[0] === '+') org = await orgModel.getById(extId.substr(1))
  else org = await orgModel.getByName(extId)
  assert(org, 'not_exist_org')
  assert(await orgModel.isHasMember(org!._id, userId), 'not_member')
  org!.info.avatar = org!.info.avatar || config!.file.cos.url + config!.file.cos.default.org
  return {
    id: org!._id,
    name: org!.rawName,
    createTime: org!.createTime,
    dev: {
      appLimit: org!.dev.appLimit,
      appOwn: org!.dev.appOwn,
      memberLimit: org!.dev.memberLimit,
      memberOwn: org!.members.length
    },
    info: org!.info
  }
}

export async function getInfo(extId: string): Promise<GetOrgsByExtId.ResBody> {
  let org: orgModel.IOrg | null
  if (extId[0] === '+') org = await orgModel.getById(extId.substr(1))
  else org = await orgModel.getByName(extId)
  assert(org, 'not_exist_org')
  org!.info.avatar = org!.info.avatar || config!.file.cos.url + config!.file.cos.default.org
  return {
    id: org!._id,
    name: org!.rawName,
    createTime: org!.createTime,
    dev: {
      appOwn: org!.dev.appOwn,
      memberOwn: org!.members.length
    },
    info: org!.info
  }
}

/**
 * 获取应用基本信息的列表
 * @param {string} orgName 组织名
 * @param {number} page 资源页码
 * @param {number} limit 资源每页数量
 * @returns {GetOrgsByNameApps.ResBody} 分页信息与应用列表
 */
export async function getAppBaseInfoList(orgName: string, page: number, limit: number): Promise<GetOrgsByNameApps.ResBody> {
  const org = await orgModel.getByName(orgName)
  assert(org, 'not_exist_org')
  const apps = await appModel.getListByOwner(org!._id, page, limit)
  const total = await appModel.getCountByOwner(org!._id)
  const data: GetOrgsByNameApps.IApp[] = []
  for (const app of apps) {
    data.push({
      id: app._id,
      name: app.rawName,
      displayName: app.info.displayName,
      state: app.state,
      avatar: app.info.avatar || config!.file.cos.url + config!.file.cos.default.app,
      description: app.info.description
    })
  }
  return {
    pagination: {
      page: page,
      limit: limit,
      total: total
    },
    data: data
  }
}
