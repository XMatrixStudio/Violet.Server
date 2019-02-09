import * as db from '../../lib/mongo'

export interface User extends db.Document {
  email: string // 用户登陆邮箱，全小写
  phone: string // 用户登陆手机，11位
  name: string // 用户名，全小写，用于索引
  rawName: string // 原始用户名
  class: number // 用户级别
  createTime: Date // 注册时间
  auth: {
    appId: string // 应用的ObjectId
  }[]
  info: UserInfo
  secure: {
    password: string // 经过加盐与多次SHA512的密码
    salt: string // 盐
    errorCount: number // 连续登陆失败的次数
    errorTime: Date // 第一次登陆失败的时间
  }
}

export interface UserInfo {
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

const userSchema = new db.Schema({
  email: { type: String, index: true },
  phone: { type: String, index: true },
  name: { type: String, index: true, required: true },
  rawName: { type: String, required: true },
  class: { type: Number, default: 0 },
  createTime: {
    type: Date,
    default: new Date()
  },
  auth: {
    appId: String
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
      salt: { type: String, required: true },
      errorCount: Number,
      errorTime: Date
    },
    required: true
  }
})

const userDB = db.model<User>('users', userSchema)

/**
 * 添加用户
 *
 * @param {Record<'email' | 'phone' | 'name' | 'nickname' | 'password' | 'salt', string>} data 用户数据
 */
export async function add(data: Record<'email' | 'phone' | 'name' | 'nickname' | 'password' | 'salt', string>): Promise<void> {
  await userDB.create({
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
}

/**
 * 获取用户信息
 *
 * @param {string} email 登陆邮箱
 * @returns {User | null} 用户信息
 */
export async function getByEmail(email: string): Promise<User | null> {
  return await userDB.findOne({ email: email.toLowerCase() })
}

/**
 * 获取用户信息
 *
 * @param {string} id ObjectId
 * @returns {User | null} 用户信息
 */
export async function getById(id: string): Promise<User | null> {
  return await userDB.findById(id)
}

/**
 * 获取用户信息
 *
 * @param {string} name 用户名
 * @returns {User | null} 用户信息
 */
export async function getByName(name: string): Promise<User | null> {
  return await userDB.findOne({ name: name.toLowerCase() })
}

/**
 * 获取用户信息
 *
 * @param {string} phone 登陆手机
 * @returns {User | null} 用户信息
 */
export async function getByPhone(phone: string): Promise<User | null> {
  return await userDB.findOne({ phone: phone.replace('+86', '') })
}

/**
 * 更新用户登陆邮箱
 *
 * @param {string} id ObjectId
 * @param {string} email 用户登陆邮箱
 */
export async function updateEmail(id: string, email: string): Promise<void> {
  await userDB.findByIdAndUpdate(id, { email: email.toLowerCase() })
}

/**
 * 更新用户登陆手机
 *
 * @param {string} id ObjectId
 * @param {string} phone 用户登陆手机
 */
export async function updatePhone(id: string, phone: string): Promise<void> {
  await userDB.findByIdAndUpdate(id, { phone: phone.replace('+86', '') })
}

/**
 * 更新用户个人信息
 *
 * @param {string} id ObjectId
 * @param {UserInfo} info 用户个人信息
 */
export async function updateInfo(id: string, info: Partial<UserInfo>): Promise<void> {
  await userDB.findByIdAndUpdate(id, { info: info })
}

/**
 * 更新用户密码
 *
 * @param {string} id ObjectId
 * @param {string} password 经过加盐和哈希的密码
 * @param {string} salt 盐
 */
export async function updatePassword(id: string, password: string, salt: string): Promise<void> {
  await userDB.findByIdAndUpdate(id, { secure: { password: password, salt: salt } })
}
