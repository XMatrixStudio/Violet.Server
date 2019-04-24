import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as orgModel from '../model/org'
import * as userModel from '../model/user'

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
