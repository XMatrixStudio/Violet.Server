import * as assert from '../../lib/assert'
import config from '../config/config'
import * as crypto from '../../lib/crypto'
import * as mailer from '../../lib/email'
import * as file from '../../lib/file'
import * as util from '../../lib/util'
import * as appModel from '../model/app'
import * as logModel from '../model/log'
import * as orgModel from '../model/org'
import * as requestModel from '../model/request'
import * as userModel from '../model/user'

export async function auth(id: string, appId: string, duration: number, scope: string[]) {
  const app = await appModel.getById(id)
  assert(app, 'not_exist_app')
  await userModel.addAuth(id, app!._id, duration, scope)
}

export async function checkPassword(id: string, password: string) {
  const user = (await userModel.getById(id))!
  const hash = crypto.hashPassword(password, user.secure.salt)
  assert(user.secure.password === hash.password, 'error_password')
}

/**
 * 获取用户的所有信息
 * @param {string} id 用户ObjectId
 * @returns {GetUsersByName.ResBody} 用户信息
 */
export async function getAllInfo(id: string): Promise<GetUsersByName.ResBody> {
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
 * 获取应用基本信息的列表
 * @param {OnlyOne<Record<'id' | 'name', string>>} u 用户ObjectId或用户名
 * @param {number} page 资源页码
 * @param {number} limit 资源每页数量
 * @returns {GetUsersByNameApps.ResBody} 分页信息与应用列表
 */
export async function getAppBaseInfoList(
  u: OnlyOne<{ id: string; name: string }>,
  page: number,
  limit: number
): Promise<GetUsersByNameApps.ResBody> {
  let id: string
  if (u.id !== undefined) id = u.id
  else {
    const user = await userModel.getByName(u.name)
    assert(user, 'not_exist_user')
    id = user!._id
  }
  const apps = await appModel.getListByOwner(id, page, limit)
  const total = await appModel.getCountByOwner(id)
  const data: GetUsersByNameApps.IApp[] = []
  for (const app of apps) {
    data.push({
      id: app._id,
      name: app.rawName,
      displayName: app.info.displayName,
      state: app.state,
      avatar: app.info.avatar || config!.file.cos.url + config!.file.cos.default,
      description: app.info.description
    })
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

export async function getAuth(id: string, appName: string): Promise<any> {
  const app = await appModel.getByName(appName)
  assert(app, 'not_exist_app')
  const auth = await userModel.getAuthById(id, app!._id)
  if (!auth) {
    return { auth: false }
  }
  return {
    auth: true,
    time: auth.time,
    duration: auth.duration
  }
}

export async function getAuths(id: string, page: number, limit: number): Promise<GetUsersAuths.ResBody> {
  const auths = await userModel.getAuths(id, page, limit)
  const authsCount = await userModel.getAuthsCount(id)
  const data: GetUsersAuths.IAuth[] = []
  for (const auth of auths) {
    data.push({
      appId: auth.app._id,
      duration: auth.duration,
      scope: auth.scope,
      time: auth.time
    })
  }
  return {
    pagination: {
      page: page,
      limit: limit,
      total: authsCount
    },
    data: data
  }
}

/**
 * 获取用户的基本信息
 * @param {string} name 用户名
 * @returns {GetUsersByName.ResBody} 用户信息
 */
export async function getBaseInfo(name: string): Promise<GetUsersByName.ResBody> {
  const user = await userModel.getByName(name)
  assert(user, 'not_exist_user')
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

/**
 * 获取组织基本信息的列表
 * @param {OnlyOne<Record<'id' | 'name', string>>} u 用户ObjectId或用户名
 * @param {number} page 资源页码
 * @param {number} limit 资源每页数量
 * @returns {GetUsersByNameOrgs.ResBody} 分页信息与组织列表
 */
export async function getOrgBaseInfoList(
  u: OnlyOne<Record<'id' | 'name', string>>,
  page: number,
  limit: number
): Promise<GetUsersByNameOrgs.ResBody> {
  let id: string
  if (u.id !== undefined) id = u.id
  else {
    const user = await userModel.getByName(u.name)
    assert(user, 'not_exist_user')
    id = user!._id
  }
  const orgs = await orgModel.getListByUserId(id, page, limit)
  const total = await orgModel.getCountByUserId(id)
  const data: GetUsersByNameOrgs.IOrg[] = []
  for (const org of orgs) {
    data.push({
      name: org.rawName,
      members: org.members.length,
      apps: org.app.own,
      avatar: org.info.avatar || config!.file.cos.url + config!.file.cos.default,
      description: org.info.description,
      location: org.info.location
    })
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

export async function removeAuth(id: string, appName: string) {
  const app = await appModel.getByName(appName)
  assert(app, 'not_exist_app')
  await userModel.removeAuth(id, app!._id)
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

export async function sendEmailCode(id: string, email: string, operator: string, code: string) {
  let user: userModel.IUser | null
  switch (operator) {
    case 'register':
      assert(!(await userModel.getByEmail(email)), 'exist_user')
      assert(await mailer.sendRegisterEmailCode(email, code), 'send_fail')
      break
    case 'reset':
      user = await userModel.getByEmail(email)
      assert(user, 'not_exist_user')
      assert(await mailer.sendResetEmailCode(email, code, user!.info.nickname), 'send_fail')
      break
    case 'update':
      user = (await userModel.getById(id))!
      assert(user.email !== email.toLowerCase(), 'same_email')
      assert(await mailer.sendUpdateEmailCode(email, code, user!.info.nickname), 'send_fail')
      break
  }
}

/**
 * 更新用户登陆信息
 * @param {string} id ObjectId
 * @param {RequireOnlyOne<Record<'email' | 'phone', string>>} user 用户登陆邮箱或手机
 */
export async function updateEmailOrPhone(id: string, u: OnlyOne<Record<'email' | 'phone', string>>) {
  const user = (await userModel.getById(id))!
  if (u.email !== undefined) {
    await userModel.setEmail(id, user.email)
  } else {
    await userModel.setPhone(id, user.phone)
  }
}

/**
 * 更新用户个人信息
 * @param {string} id ObjectId
 * @param {Partial<userModel.IUserInfo>} info 用户个人信息
 */
export async function updateInfo(id: string, info: Partial<userModel.IUserInfo>) {
  if (info.avatar) {
    await file.upload(id + '.png', Buffer.from(info.avatar.replace('data:image/png;base64,', ''), 'base64'))
    info.avatar = config!.file.cos.url + id + '.png'
  }
  await userModel.setInfo(id, info)
}

export async function updateLevel(id: string, level: 1 | 50 | 99, remark?: string, name?: string, email?: string, phone?: string) {
  const user = (await userModel.getById(id))!
  if (level === 1) {
    assert(user.level === 0, 'not_normal_user')
    await userModel.addDeveloper(id, name!, email!, phone!)
    await requestModel.addUser(id, 0, remark, 1)
  } else if (level === 50) {
    assert(user.level === 1, 'not_developer')
    assert(!(await requestModel.isExistByTargetAndType(id, requestModel.RequestType.LevelAdmin)), 'repeat_request')
    await requestModel.addUser(id, 1, remark)
  } else {
    assert(user.level === 1, 'not_developer')
    assert(!(await userModel.isExistByLevel(99)), 'limit_level')
    await userModel.setLevel(id, 99)
  }
}

export async function updateDevLimit(id: string, type: 'app' | 'org', remark: string) {
  if (type === 'app') {
    assert(!(await requestModel.isExistByTargetAndType(id, 10)), 'repeat_request')
    await requestModel.addUser(id, 10, remark)
  } else {
    assert(!(await requestModel.isExistByTargetAndType(id, 11)), 'repeat_request')
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
  await logModel.addPasswordChange(id)
}
