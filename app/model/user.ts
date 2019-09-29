import { ObjectId } from 'bson'

import db from '.'
import { IApp } from './app'
import * as redis from './redis'

export interface IUser {
  _id: any // ObjectId
  email: string // 用户登陆邮箱，全小写
  phone: string // 用户登陆手机，11位
  name: string // 用户名，全小写，用于索引
  rawName: string // 原始用户名
  level: number // 用户等级，0 => 普通用户，1 => 开发者，50 => 管理员，99 => 超级管理员
  createTime: Date // 注册时间
  secure: {
    password: string
    salt: string
  }
  info: IUserInfo // 个人信息
  auth: IUserAuth[]
  dev?: IUserDev // 开发者信息
}

export interface IUserInfo {
  avatar: string // 头像URL
  bio: string // 个人简介
  birthday: Date // 生日
  email: string // 联系邮箱
  gender: number // 性别
  location: string // 个人地址
  nickname: string // 昵称
  phone: string // 联系电话
  url: string // 个人URL
}

export interface IUserAuth {
  _app: IApp
  state: number // 随机状态，用于判断Token的有效性
  time: Date
  duration: number
  scope: string[]
}

export interface IUserDev {
  name: string // 联系名称
  email: string // 联系邮箱
  phone: string // 联系电话
  appLimit: number // 应用上限
  appOwn: number // 所属应用数量
  orgJoin: number // 协作组织数量
  orgLimit: number // 组织上限
  orgOwn: number // 所属组织数量
}

interface UserDocument extends db.Document, IUser {}

const userSchema = new db.Schema({
  email: { type: String, index: true },
  phone: { type: String, index: true },
  name: { type: String, index: { unique: true }, required: true },
  rawName: { type: String, required: true },
  level: { type: Number, default: 0 },
  createTime: {
    type: Date,
    default: Date.now
  },
  info: {
    avatar: String,
    bio: String,
    birthday: Date,
    email: String,
    gender: Number,
    location: String,
    nickname: String,
    phone: String,
    url: String
  },
  secure: {
    type: {
      password: { type: String, required: true },
      salt: { type: String, required: true }
    },
    required: true
  },
  auth: [
    {
      _app: { type: ObjectId, ref: 'apps', required: true },
      time: { type: Date, default: Date.now },
      duration: Number,
      state: Number,
      scope: [String]
    }
  ],
  dev: {
    type: {
      name: String,
      email: String,
      phone: String,
      appLimit: Number,
      appOwn: Number,
      orgJoin: Number,
      orgLimit: Number,
      orgOwn: Number
    }
  }
})

const userDB = db.model<UserDocument>('users', userSchema)

/**
 * 添加用户
 * @param {Record<'email' | 'phone' | 'name' | 'nickname' | 'password' | 'salt', string>} data 用户数据
 * @returns {string} 新用户的ObjectId
 */
export async function add(data: Record<'email' | 'phone' | 'name' | 'nickname' | 'password' | 'salt', string>): Promise<string> {
  const user = await userDB.create({
    email: data.email,
    phone: data.phone,
    name: data.name.toLowerCase(),
    rawName: data.name,
    info: {
      nickname: data.nickname
    },
    secure: {
      password: data.password,
      salt: data.salt
    }
  })
  return user._id
}

export async function addAuth(id: string, appId: string, duration: number, scope: string[]): Promise<void> {
  const result = await userDB.updateOne(
    { _id: id, 'auth._app': { $ne: appId } },
    { $push: { auth: { $each: [{ _app: appId, duration: duration, scope: scope }], $sort: { time: -1 } } } }
  )
  if (result.n === 0) {
    await userDB.updateOne(
      { _id: id, 'auth._app': appId },
      { 'auth.$': { _app: appId, time: Date.now(), duration: duration, scope: scope } }
    )
    await userDB.updateOne({ _id: id, 'auth._app': appId }, { $push: { auth: { $each: [], $sort: { time: -1 } } } })
  }
}

export async function addDeveloper(id: string, name: string, email: string, phone: string): Promise<void> {
  await userDB.findByIdAndUpdate(id, {
    level: 1,
    dev: {
      name: name,
      email: email,
      phone: phone,
      appLimit: 5,
      appOwn: 0,
      orgJoin: 0,
      orgLimit: 5,
      orgOwn: 0
    }
  })
  await redis.set(`level-${id}`, '1', 1296000)
}

export async function getAuthById(id: string, appId: string): Promise<IUserAuth | null> {
  const user = await userDB.findOne({ _id: id, 'auth._app': appId })
  if (!user) return null
  return user.auth[0]
}

export async function getAuthsWith(id: string, page: number, limit: number, populate: string): Promise<IUserAuth[]> {
  const user = await userDB.findById(id, { auth: { $slice: [(page - 1) * limit, limit] } }).populate('auth._app', populate)
  if (!user) return []
  return user.auth
}

export async function getAuthsCount(id: string): Promise<number> {
  return (await userDB.aggregate([{ $match: { _id: new ObjectId(id) } }, { $project: { n: { $size: '$auth' } } }]))[0].n
}

/**
 * 获取用户信息
 *
 * @param {string} email 登陆邮箱
 * @returns {User | null} 用户信息
 */
export async function getByEmail(email: string): Promise<UserDocument | null> {
  return await userDB.findOne({ email: email.toLowerCase() })
}

/**
 * 获取用户信息
 *
 * @param {string} id ObjectId
 * @returns {User | null} 用户信息
 */
export async function getById(id: string): Promise<IUser | null> {
  return await userDB.findById(id)
}

/**
 * 获取用户信息
 * @param {string} name 用户名
 * @returns {User | null} 用户信息
 */
export async function getByName(name: string): Promise<IUser | null> {
  return await userDB.findOne({ name: name.toLowerCase() })
}

/**
 * 获取用户信息
 *
 * @param {string} phone 登陆手机
 * @returns {User | null} 用户信息
 */
export async function getByPhone(phone: string): Promise<UserDocument | null> {
  return await userDB.findOne({ phone: phone.replace('+86', '') })
}

/**
 * 获取用户等级
 * @param {string} id 用户ObjectId
 * @returns {number} 用户等级
 */
export async function getLevelById(id: string): Promise<number> {
  const levelStr = await redis.get(`level-${id}`)
  if (levelStr === null) {
    const level = (await getById(id))!.level
    await redis.set(`level-${id}`, level.toString(), 1296000)
    return level
  }
  return parseInt(levelStr)
}

export async function getListByReg(regexp: RegExp, page: number, limit: number): Promise<IUser[]> {
  return await userDB
    .find({ $or: [{ name: { $regex: regexp } }, { email: { $regex: regexp } }, { phone: { $regex: regexp } }] })
    .skip((page - 1) * limit)
    .limit(limit)
}

export async function getListByRegCount(regexp: RegExp): Promise<number> {
  return await userDB.countDocuments({ $or: [{ name: { $regex: regexp } }, { email: { $regex: regexp } }, { phone: { $regex: regexp } }] })
}

export async function isExist(id: string): Promise<boolean> {
  return (await userDB.findById(id).countDocuments()) !== 0
}

export async function isExistByLevel(level: number): Promise<boolean> {
  return (await userDB.countDocuments({ level: level })) !== 0
}

export async function removeAuth(id: string, appId: string) {
  await userDB.updateOne({ _id: id, 'auth._app': appId }, { $pull: { auth: { _app: appId } } })
}

export async function setAuthState(id: string, appId: string, state: number) {
  await userDB.updateOne({ _id: id, 'auth._app': appId }, { 'auth.$.state': state })
}

export async function setDevInfo(id: string, name: string, email: string, phone: string) {
  await userDB.updateOne({ _id: id }, { 'dev.email': email, 'dev.name': name, 'dev.phone': phone })
}

/**
 * 更新用户登陆邮箱
 * @param {string} id 用户ObjectId
 * @param {string} email 用户登陆邮箱
 */
export async function setEmail(id: string, email: string) {
  await userDB.updateOne({ _id: id }, { email: email.toLowerCase() })
}

/**
 * 更新用户个人信息
 * @param {string} id ObjectId
 * @param {Partial<IUserInfo>} info 用户个人信息
 */
export async function setInfo(id: string, info: Partial<IUserInfo>) {
  const user = (await userDB.findById(id))!
  user.info = Object.assign(user.info, info)
  await user.save()
}

export async function setLevel(id: string, level: number) {
  await userDB.updateOne({ _id: id }, { level: level })
  await redis.set(`level-${id}`, level.toString(), 1296000)
}

/**
 * 更新用户登陆手机
 * @param {string} id 用户ObjectId
 * @param {string} phone 用户登陆手机
 */
export async function setPhone(id: string, phone: string) {
  await userDB.updateOne({ _id: id }, { phone: phone.replace('+86', '') })
}

/**
 * 更新用户开发状态
 * @param {string} id 用户ObjectId
 * @param {string} type 更新状态类型，可为`appOwn`、`orgOwn`、`orgJoin`
 * @param {number} offset 修改的偏移量
 */
export async function updateDevState(id: string, type: 'appOwn' | 'orgOwn' | 'orgJoin', offset: number) {
  switch (type) {
    case 'appOwn':
      await userDB.updateOne({ _id: id }, { $inc: { 'dev.appOwn': offset } })
      break
    case 'orgOwn':
      await userDB.updateOne({ _id: id }, { $inc: { 'dev.orgOwn': offset } })
      break
    case 'orgJoin':
      await userDB.updateOne({ _id: id }, { $inc: { 'dev.orgJoin': offset } })
      break
  }
}

/**
 * 更新用户密码
 * @param {string} id ObjectId
 * @param {string} password 经过加盐和哈希的密码
 * @param {string} salt 盐
 */
export async function updatePassword(id: string, password: string, salt: string): Promise<void> {
  await userDB.findByIdAndUpdate(id, { secure: { password: password, salt: salt } })
}
