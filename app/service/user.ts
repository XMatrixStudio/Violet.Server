import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as userModel from '../model/user'

export const register = async (email: string, name: string, password: string): Promise<string | null> => {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(await userModel.getByEmail(email), 'exist_email')
  assert(await userModel.getByName(name), 'exist_name')
  const salt = util.rand(260)
  password = util.hash(util.hash(password).concat(salt))
  return await userModel.add(email, name, password, salt)
}
