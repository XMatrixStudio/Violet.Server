import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as userModel from '../model/user'

export const login = async (email: string | null, name: string | null, password: string) => {
  let user: userModel.User | null
  if (email !== null) {
    user = await userModel.getByEmail(email)
  } else if (name !== null) {
    user = await userModel.getByName(name)
  } else {
    user = null
  }
  assert(user, 'error_user_or_password') // 用户不存在
  const hash = util.hash(util.hash(password).concat(user!.secure.salt))
  assert(hash === user!.secure.password, 'error_user_or_password') // 密码错误
  // TODO: default avatar
  return {
    id: user!._id,
    name: user!.nickname,
    email: user!.email,
    avatar: user!.info.avatar,
    valid: user!.secure.valid
  }
}

export const register = async (email: string, name: string, password: string): Promise<string | null> => {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(await userModel.getByEmail(email), 'exist_email')
  assert(await userModel.getByName(name), 'exist_name')
  const salt = util.rand(260)
  password = util.hash(util.hash(password).concat(salt))
  return await userModel.add(email, name, password, salt)
}
