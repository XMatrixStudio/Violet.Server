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
import { RequestType } from '../model/request'
import * as userModel from '../model/user'

export async function auth(id: string, appId: string, duration: number, scope: string[]) {
  assert(await appModel.isExist(appId), 'not_exist_app')
  await userModel.addAuth(id, appId, duration, scope)
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
export async function getAllInfo(id: string): Promise<GetUsersByExtUid.ResBody> {
  const user = (await userModel.getById(id))!
  user.info.avatar = user.info.avatar || config!.file.cos.url + config!.file.cos.default.user
  const log = (await logModel.getUserLog(id))!
  return {
    id: user._id,
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
 * @param {string} id 用户ObjectId
 * @param {number} page 资源页码
 * @param {number} limit 资源每页数量
 * @returns {GetUsersByNameApps.ResBody} 分页信息与应用列表
 */
export async function getAppBaseInfoList(id: string, page: number, limit: number): Promise<GetUsersByUidApps.ResBody> {
  assert(await userModel.isExist(id), 'not_exist_user')
  const apps = await appModel.getListByOwner(id, page, limit)
  const count = await appModel.getCountByOwner(id)
  const data: GetUsersByUidApps.IApp[] = []
  for (const app of apps) {
    data.push({
      id: app._id,
      name: app.rawName,
      displayName: app.info.displayName,
      state: app.state,
      avatar: app.info.avatar || config!.file.cos.url + config!.file.cos.default.app,
      description: app.info.description
    })
  }
  return {
    pagination: { page: page, limit: limit, total: count },
    data: data
  }
}

export async function getAuth(id: string, appId: string, url: string): Promise<GetUsersAuthsByAppId.ResBody> {
  const app = await appModel.getById(appId)
  assert(app, 'not_exist_app')
  const callbackHosts = app!.callbackHosts.map(v => v + (v[v.length - 1] !== '/' ? '/' : ''))
  assert(callbackHosts.some(value => url.indexOf(value) === 0), 'error_redirect_url')
  const auth = await userModel.getAuthById(id, appId)
  assert(auth && Date.now() - auth.time.getTime() < 1000 * 60 * 60 * 24 * auth.duration, 'not_exist_auth')
  return {
    code: crypto.generateCode(id, appId),
    duration: auth!.duration,
    scope: auth!.scope,
    time: auth!.time
  }
}

export async function getAuths(id: string, page: number, limit: number): Promise<GetUsersAuths.ResBody> {
  const auths = await userModel.getAuthsWith(id, page, limit, '_id rawName info.displayName ')
  const count = await userModel.getAuthsCount(id)
  const data: GetUsersAuths.IAuth[] = []
  for (const auth of auths) {
    data.push({
      appId: auth._app._id,
      appName: auth._app.rawName,
      appAvatar: auth._app.info.avatar || config!.file.cos.url + config!.file.cos.default.app,
      appDisplayName: auth._app.info.displayName,
      duration: auth.duration,
      scope: auth.scope,
      time: auth.time
    })
  }
  return {
    pagination: {
      page: page,
      limit: limit,
      total: count
    },
    data: data
  }
}

/**
 * 获取用户的基本信息
 * @param {string} extId 用户扩展Id
 * @returns {GetUsersByExtId.ResBody} 用户信息
 */
export async function getBaseInfo(extId: string): Promise<GetUsersByExtUid.ResBody> {
  let user: userModel.IUser | null
  if (extId[0] === '+') user = await userModel.getById(extId.substr(1))
  else user = await userModel.getByName(extId)
  assert(user, 'not_exist_user')
  user!.info.avatar = user!.info.avatar || config!.file.cos.url + config!.file.cos.default.user
  const devInfo = user!.dev && {
    appOwn: user!.dev!.appOwn,
    orgJoin: user!.dev!.orgJoin,
    orgOwn: user!.dev!.orgOwn
  }
  return {
    id: user!._id,
    name: user!.rawName,
    level: user!.level,
    createTime: user!.createTime,
    info: user!.info,
    dev: devInfo
  }
}

/**
 * 获取组织基本信息的列表
 * @param {string} id 用户ObjectId
 * @param {number} page 资源页码
 * @param {number} limit 资源每页数量
 * @returns {GetUsersByNameOrgs.ResBody} 分页信息与组织列表
 */
export async function getOrgBaseInfoList(id: string, page: number, limit: number): Promise<GetUsersByUidOrgs.ResBody> {
  assert(await userModel.isExist(id), 'not_exist_user')
  const orgs = await orgModel.getListByUserId(id, page, limit)
  const count = await orgModel.getCountByUserId(id)
  const data: GetUsersByUidOrgs.IOrg[] = []
  for (const org of orgs) {
    data.push({
      id: org._id,
      name: org.rawName,
      avatar: org.info.avatar || config!.file.cos.url + config!.file.cos.default.org,
      displayName: org.info.displayName
    })
  }
  return {
    pagination: { page: page, limit: limit, total: count },
    data: data
  }
}

export async function getRequestList(id: string): Promise<GetUsersRequests.ResBody> {
  const requests = await requestModel.getOpenListByTarget(id)
  const data: GetUsersRequests.IRequest[] = []
  for (const request of requests) {
    data.push({ remark: request.remark, time: request.time, type: request.type })
  }
  return data
}

export async function getUserListByReg(regExp: string, page: number, limit: number): Promise<GetUsers.ResBody> {
  const reg = new RegExp(regExp, 'i')
  const users = await userModel.getListByReg(reg, page, limit)
  const count = await userModel.getListByRegCount(reg)
  const data: GetUsers.IUser[] = []
  for (const user of users) {
    user.info.avatar = user.info.avatar || config!.file.cos.url + config!.file.cos.default.user
    data.push({
      id: user._id,
      name: user.rawName,
      nickname: user.info.nickname,
      avatar: user.info.avatar,
      email: user.info.email,
      phone: user.info.phone
    })
  }
  return {
    pagination: { page: page, limit: limit, total: count },
    data: data
  }
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

export async function removeAuth(id: string, appId: string) {
  assert(await appModel.isExist(appId), 'not_exist_app')
  await userModel.removeAuth(id, appId)
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

export async function sendPhoneCode(id: string, phone: string, operator: string, code: string) {
  let user: userModel.IUser | null
  switch (operator) {
    case 'register':
      assert(!(await userModel.getByPhone(phone)), 'exist_user')
      // TODO: 发送短信
      assert(true, 'send_fail')
      break
    case 'reset':
      user = await userModel.getByPhone(phone)
      assert(user, 'not_exist_user')
      // TODO: 发送短信
      assert(true, 'send_fail')
      break
    case 'update':
      user = (await userModel.getById(id))!
      assert(user.phone !== phone.replace('+86', ''), 'same_phone')
      // TODO: 发送短信
      assert(true, 'send_fail')
      break
  }
}

export async function updateDevInfo(id: string, name: string, email: string, phone: string) {
  await userModel.setDevInfo(id, name, email, phone)
}

/**
 * 更新用户登陆信息
 * @param {string} id ObjectId
 * @param {RequireOnlyOne<Record<'email' | 'phone', string>>} user 用户登陆邮箱或手机
 */
export async function updateEmailOrPhone(id: string, u: OnlyOne<Record<'email' | 'phone', string>>) {
  const user = (await userModel.getById(id))!
  if (u.email !== undefined) {
    await userModel.setEmail(id, u.email)
  } else {
    await userModel.setPhone(id, u.phone)
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
    await userModel.addDeveloper(id, name!, email!, phone!)
    await requestModel.addUser(id, RequestType.LevelDev, remark, 1)
  } else if (level === 50) {
    assert(!(await requestModel.isExistByTargetAndType(id, RequestType.LevelAdmin)), 'repeat_request')
    await requestModel.addUser(id, RequestType.LevelAdmin, remark)
  } else {
    assert(!(await userModel.isExistByLevel(99)), 'limit_level')
    await userModel.setLevel(id, 99)
  }
}

export async function updateDevLimit(id: string, type: 'app' | 'org', remark: string) {
  if (type === 'app') {
    assert(!(await requestModel.isExistByTargetAndType(id, RequestType.UserAppLimit)), 'repeat_request')
    await requestModel.addUser(id, RequestType.UserAppLimit, remark)
  } else {
    assert(!(await requestModel.isExistByTargetAndType(id, RequestType.UserOrgLimit)), 'repeat_request')
    await requestModel.addUser(id, RequestType.UserOrgLimit, remark)
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
