import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as orgModel from '../model/org'
import * as userModel from '../model/user'

export async function createOrganization(userId: string, name: string, description: string, contact: string, email: string, phone: string) {
  const user = (await userModel.getById(userId))!
  assert(user.dev!.org.limit > user.dev!.org.own, 'limit_orgs')
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(!(await orgModel.getByName(name)) && !(await userModel.getByName(name)), 'exist_name')
  await orgModel.add(userId, name, description, contact, email, phone)
  await userModel.updateDevState(userId, 'org.own', 1)
}
