import * as assert from '../../lib/assert'
import * as config from '../../lib/config'
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

/**
 * 获取用户信息
 *
 * @param {string} id ObjectId
 */
export async function getInfo(id: string): Promise<User.GET.Body> {
  const user = await userModel.getById(id)
  user!.info.avatar = user!.info.avatar || config.avatar.default
  return {
    email: user!.email,
    phone: user!.phone,
    name: user!.rawName,
    class: user!.class,
    createTime: user!.createTime,
    info: user!.info
  }
}

/**
 * 用户登陆
 *
 * @param {RequireOnlyOne<Record<'email' | 'phone' | 'name', string>>} data 用户唯一标识
 * @param {string} password 密码的SHA512散列值
 */
export async function login(data: RequireOnlyOne<Record<'email' | 'phone' | 'name', string>>, password: string) {
  let user: userModel.User | null
  if (data.email) {
    user = await userModel.getByEmail(data.email)
  } else if (data.phone) {
    user = await userModel.getByPhone(data.phone)
  } else {
    user = await userModel.getByName(data.name!)
  }
  assert(user, 'error_user_or_password') // 用户不存在
  const hash = util.hash(util.hash(password).concat(user!.secure.salt))
  assert(hash === user!.secure.password, 'error_user_or_password') // 密码错误
  return {
    id: user!._id,
    name: user!.info.nickname,
    email: user!.email,
    avatar: user!.info.avatar || config.avatar.default
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
