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
 * 根据登陆手机获取用户名, 如果用户不存在则返回`null`
 *
 * @param {string} phone 用户登陆手机
 * @returns {string | null} 用户名或
 */
export async function getUserNameByPhone(phone: string): Promise<string | null> {
  const user = await userModel.getByPhone(phone)
  return user !== null ? user.name : null
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
 * @returns {User} 用户信息
 */
export async function login(data: RequireOnlyOne<Record<'email' | 'phone' | 'name', string>>, password: string): Promise<userModel.User> {
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
  return user!
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
 * @param {RequireOnlyOne<Record<'email' | 'phone', string>>} user 用户登陆邮箱或手机
 * @param {string} password 新密码的SHA512散列值
 */
export async function resetPassword(user: RequireOnlyOne<Record<'email' | 'phone', string>>, password: string): Promise<void> {
  let id: string
  if (user.email) {
    id = (await userModel.getByEmail(user.email))!._id
  } else {
    id = (await userModel.getByPhone(user.phone!))!._id
  }
  const hash = crypto.hashPassword(password)
  await userModel.updatePassword(id, hash.password, hash.salt)
  await userModel.updateLoginError(id, 0)
}

/**
 * 更新用户登陆信息
 *
 * @param {string} id ObjectId
 * @param {RequireOnlyOne<Record<'email' | 'phone', string>>} user 用户登陆邮箱或手机
 */
export async function updateEmailOrPhone(id: string, user: RequireOnlyOne<Record<'email' | 'phone', string>>): Promise<void> {
  if (user.email) {
    await userModel.updateEmail(id, user.email)
  } else {
    await userModel.updatePhone(id, user.phone!)
  }
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
