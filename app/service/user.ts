import * as assert from '../../lib/assert'
import config from '../config/config'
import * as crypto from '../../lib/crypto'
import * as file from '../../lib/file'
import * as util from '../../lib/util'
import * as logModel from '../model/log'
import * as orgModel from '../model/org'
import * as requestModel from '../model/request'
import * as userModel from '../model/user'

/**
 * 获取用户的所有信息
 * @param {string} id 用户ObjectId
 * @returns {User.GET.ResponseBody} 用户信息
 */
export async function getAllInfo(id: string): Promise<User.GET.ResponseBody> {
  const user = (await userModel.getById(id))!
  user.info.avatar = user.info.avatar || config!.file.cos.url + config!.file.cos.default
  const log = (await logModel.getUserLog(id))!
  return {
    email: user.email,
    phone: user.phone,
    name: user.rawName,
    level: user.level,
    createTime: user.createTime,
    info: user.info,
    dev: user.dev,
    log: {
      login: log.login,
      password: log.password[0] && log.password[0].time
    }
  }
}

/**
 * 获取用户信息
 * 使用ObjecId获取时返回所有信息，使用用户名获取时返回公开信息
 * @param {OnlyOne<Record<'id' | 'name', string>>} data ObjectId或用户名
 * @returns {User.GET.ResponseBody} 用户信息
 */
export async function getInfo(data: OnlyOne<Record<'id' | 'name', string>>): Promise<User.GET.ResponseBody> {
  if (data.id) {
    const user = (await userModel.getById(data.id))!
    user.info.avatar = user.info.avatar || config!.file.cos.url + config!.file.cos.default
    return {
      email: user.email,
      phone: user.phone,
      name: user.rawName,
      level: user.level,
      createTime: user.createTime,
      info: user.info,
      dev: user.dev
    }
  } else {
    const user = await userModel.getByName(data.name!)
    assert(user, 'not_found')
    user!.info.avatar = user!.info.avatar || config!.file.cos.url + config!.file.cos.default
    const devInfo = user!.dev && {
      app: {
        limit: user!.dev!.app.limit,
        own: user!.dev!.app.own
      },
      org: {
        limit: user!.dev!.org.limit,
        own: user!.dev!.org.own,
        join: user!.dev!.org.join
      }
    }
    return {
      name: user!.rawName,
      level: user!.level,
      createTime: user!.createTime,
      info: user!.info,
      dev: devInfo
    }
  }
}

export async function getOrgsBaseInfo(
  uid: RequireOnlyOne<Record<'id' | 'name', string>>,
  page: number,
  limit: number
): Promise<User.Orgs.GET.ResponseBody> {
  let id: string
  if (uid.id !== undefined) id = uid.id
  else {
    const user = await userModel.getByName(uid.name)
    assert(user, 'not_exist_user')
    id = user!._id
  }
  const orgs = await orgModel.getListByUserId(id, page, limit)
  const total = await orgModel.getCountByUserId(id)
  const data: User.Orgs.IOrg[] = []
  for (const i in orgs) {
    data[i] = {
      name: orgs[i].rawName,
      avatar: orgs[i].info.avatar || config!.file.cos.url + config!.file.cos.default,
      create_time: orgs[i].createTime,
      description: orgs[i].info.description
    }
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

/**
 * 根据登陆邮箱获取用户名, 如果用户不存在则返回`null`
 * @param {string} email 用户登陆邮箱
 * @returns {string | null} 用户名或
 */
export async function getUserNameByEmail(email: string): Promise<string | null> {
  const user = await userModel.getByEmail(email)
  return user !== null ? user.name : null
}

/**
 * 根据登陆手机获取用户名, 如果用户不存在则返回`null`
 * @param {string} phone 用户登陆手机
 * @returns {string | null} 用户名或
 */
export async function getUserNameByPhone(phone: string): Promise<string | null> {
  const user = await userModel.getByPhone(phone)
  return user !== null ? user.name : null
}

/**
 * 用户登陆
 * @param {OnlyOne<Record<'email' | 'phone' | 'name', string>>} data 用户唯一标识
 * @param {string} password 密码的SHA512散列值
 * @param {string} ip 用户登陆IP
 * @returns {User} 用户信息
 */
export async function login(data: OnlyOne<Record<'email' | 'phone' | 'name', string>>, password: string, ip: string): Promise<string> {
  let user: userModel.IUser | null
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
  await logModel.addLogin(user!._id, ip)
  return user!._id
}

/**
 * 用户注册
 * @param {string} email 用户登陆邮箱
 * @param {string} phone 用户登陆手机
 * @param {string} name 用户名
 * @param {string} nickname 昵称
 * @param {string} password 密码的SHA512散列值
 */
export async function register(email: string, phone: string, name: string, nickname: string, password: string) {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(!(await orgModel.getByName(name)) && !(await userModel.getByName(name)), 'exist_name')
  const hash = crypto.hashPassword(password)
  const id = await userModel.add({ email: email, phone: phone, name: name, nickname: nickname, password: hash.password, salt: hash.salt })
  await logModel.addUser(id)
}

/**
 * 重置用户密码
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
}

/**
 * 更新用户登陆信息
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
 * @param {string} id ObjectId
 * @param {UserInfo} info 用户个人信息
 */
export async function updateInfo(id: string, info: Partial<userModel.IUserInfo>): Promise<void> {
  if (info.avatar) {
    await file.upload(id + '.jpg', Buffer.from(info.avatar.replace('data:image/jpeg;base64,', ''), 'base64'))
    info.avatar = config!.file.cos.url + id + '.jpg'
  }
  await userModel.updateInfo(id, info)
}

export async function updateLevel(id: string, level: 1 | 50 | 99, name: string, email: string, phone: string, remark?: string) {
  const user = (await userModel.getById(id))!
  if (level === 1) {
    assert(user.level === 0, 'not_normal_user')
    await userModel.addDeveloper(id, name, email, phone)
    await requestModel.addUser(id, 0, remark, 1)
  } else if (level === 50) {
    assert(user.level === 1, 'not_developer')
    assert(!(await requestModel.checkIfExistByTargetAndType(id, 1)), 'repeat_request')
    await userModel.updateDevInfo(id, name, email, phone)
    await requestModel.addUser(id, 1, remark)
  } else {
    assert(!(await userModel.checkIfExistByLevel(99)), 'limit_level')
    await userModel.updateLevel(id, 99)
  }
}

export async function updateDevLimit(id: string, type: 'app' | 'org', remark: string) {
  if (type === 'app') {
    assert(!(await requestModel.checkIfExistByTargetAndType(id, 10)), 'repeat_request')
    await requestModel.addUser(id, 10, remark)
  } else {
    assert(!(await requestModel.checkIfExistByTargetAndType(id, 11)), 'repeat_request')
    await requestModel.addUser(id, 11, remark)
  }
}

/**
 * 更新用户密码
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
