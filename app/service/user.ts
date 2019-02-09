import * as assert from '../../lib/assert'
import * as config from '../../lib/config'
import * as crypto from '../../lib/crypto'
import * as file from '../../lib/file'
import * as util from '../../lib/util'
import * as userModel from '../model/user'

/**
 * 根据登陆邮箱获取用户名, 如果用户不存在则返回`null`
 *
 * @param {string} email 用户登陆邮箱
 * @returns {string | null} 用户名或
 */
export async function getUserNameByEmail(email: string): Promise<string | null> {
  const user = await userModel.getByEmail(email)
  return user !== null ? user.name : null
}

/**
 * 检查是否存在用户使用该手机
 *
 * @param {string} phone 用户登陆手机
 * @returns {boolean} 手机是否已使用
 */
export async function checkIfExistUserByPhone(phone: string): Promise<boolean> {
  return (await userModel.getByPhone(phone)) !== null
}

/**
 * 获取用户信息
 *
 * @param {string} id ObjectId
 */
export async function getInfo(id: string): Promise<User.GET.ResponseBody> {
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
 * @returns {string} ObjectId
 */
export async function login(data: RequireOnlyOne<Record<'email' | 'phone' | 'name', string>>, password: string): Promise<string> {
  let user: userModel.User | null
  if (data.email) {
    user = await userModel.getByEmail(data.email)
  } else if (data.phone) {
    user = await userModel.getByPhone(data.phone)
  } else {
    user = await userModel.getByName(data.name!)
  }
  assert(user, 'error_user_or_password') // 用户不存在
  const hash = crypto.hashPassword(password, user!.secure.salt)
  assert(hash.password === user!.secure.password, 'error_user_or_password') // 密码错误
  return user!._id
}

/**
 * 用户注册
 *
 * @param {string} email 用户登陆邮箱
 * @param {string} phone 用户登陆手机
 * @param {string} name 用户名
 * @param {string} nickname 昵称
 * @param {string} password 密码的SHA512散列值
 */
export async function register(email: string, phone: string, name: string, nickname: string, password: string): Promise<void> {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert((await userModel.getByName(name)) === null, 'exist_name')
  const hash = crypto.hashPassword(password)
  await userModel.add({ email: email, phone: phone, name: name, nickname: nickname, password: hash.password, salt: hash.salt })
}

/**
 * 重置用户密码
 *
 * @param {string} email 用户邮箱
 * @param {string} password 新密码的SHA512散列值
 */
export async function resetPassword(email: string, password: string): Promise<void> {
  const user = await userModel.getByEmail(email)
  // TODO: check user in post email
  assert(user, 'not_exist_user')
  const hash = crypto.hashPassword(password)
  await userModel.updatePassword(user!._id, hash.password, hash.salt)
}

/**
 * 更新用户登陆邮箱
 *
 * @param {string} id ObjectId
 * @param {string} email 用户登陆邮箱
 */
export async function updateEmail(id: string, email: string): Promise<void> {
  const user = await userModel.getByEmail(email)
  assert(user && user._id === id, 'same_email')
  assert(!user, 'exist_user')
  await userModel.updateEmail(id, email)
}

/**
 * 更新用户个人信息
 *
 * @param {string} id ObjectId
 * @param {UserInfo} info 用户个人信息
 */
export async function updateInfo(id: string, info: Partial<userModel.UserInfo>): Promise<void> {
  if (info.avatar) {
    await file.upload(id + '.jpg', Buffer.from(info.avatar.replace('data:image/jpeg;base64,', ''), 'base64'))
    info.avatar = config.avatar.cos.url + id + '.jpg'
  }
  await userModel.updateInfo(id, info)
}

/**
 * 更新用户密码
 *
 * @param {string} id ObjectId
 * @param {string} oldPassword 旧密码的SHA512散列值
 * @param {string} newPassword 新密码的SHA512散列值
 */
export async function updatePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
  const user = await userModel.getById(id)
  let hash = crypto.hashPassword(oldPassword, user!.secure.salt)
  assert(hash.password === user!.secure.password, 'error_password')
  assert(oldPassword !== newPassword, 'same_password')
  hash = crypto.hashPassword(newPassword)
  await userModel.updatePassword(id, hash.password, hash.salt)
}
