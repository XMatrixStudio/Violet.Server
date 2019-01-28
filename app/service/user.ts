import * as assert from '../../lib/assert'
import * as util from '../../lib/util'
import * as userModel from '../model/user'

/**
 * 检查是否存在用户使用该邮箱
 *
 * @param {string} email 用户唯一邮箱
 * @returns {boolean} 邮箱是否已使用
 */
export async function checkIfExistUserByEmail(email: string): Promise<boolean> {
  return (await userModel.getByEmail(email)) !== null
}

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
    avatar: user!.info.avatar
  }
}

/**
 * 用户注册
 *
 * @param {string} email 用户登陆邮箱
 * @param {string} phone 用户登陆手机
 * @param {string} name 用户名
 * @param {string} nickname 昵称
 * @param {string} password 密码的SHA512哈希值
 */
export async function register(email: string, phone: string, name: string, nickname: string, password: string): Promise<boolean> {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert((await userModel.getByName(name)) === null, 'exist_name')
  const salt = util.rand(260)
  password = util.hash(util.hash(password).concat(salt))
  return await userModel.add({ email: email, phone: phone, name: name, nickname: nickname, password: password, salt: salt })
}
