import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as levelModel from '../model/level'
import * as orgModel from '../model/org'
import * as userModel from '../model/user'

/**
 * 创建组织
 *
 * @param {string} userId 用户ObjectId
 * @param {string} name 组织名
 */
export async function createOrganization(userId: string, name: string): Promise<void> {
  // assert(!util.isReservedUsername(name), 'reserved_name')
  // assert((await orgModel.getByName(name)) === null && (await userModel.getByName(name)) === null, 'exist_name')
  // const user = await userModel.getById(userId)
  // const level = await levelModel.getByLevel(user!.level)
  // assert(level!.orgLimit === -1 || user!.dev.org.own + user!.dev.org.member < level!.orgLimit, 'limit_orgs')
  // await orgModel.add(userId, name)
  // await userModel.updateDev(userId, 'org.own', 1)
}
