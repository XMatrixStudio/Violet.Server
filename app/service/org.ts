import * as assert from '../../lib/assert'
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
 * @param {string} description 简介
 * @param {string} contact 联系人
 * @param {string} email 联系邮箱
 * @param {string} phone 联系电话
 */
export async function createOrg(userId: string, name: string, description: string, contact: string, email: string, phone: string) {
  const user = (await userModel.getById(userId))!
  assert(user.dev!.org.limit > user.dev!.org.own, 'limit_orgs')
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(!(await orgModel.getByName(name)) && !(await userModel.getByName(name)), 'exist_name')
  await orgModel.add(userId, name, description, contact, email, phone)
  await userModel.updateDevState(userId, 'org.own', 1)
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
      avatar: app.info.avatar || config!.file.cos.url + config!.file.cos.default,
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
