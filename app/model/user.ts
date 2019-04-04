import db from '.'

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

export interface IUserDev {
  name: string // 联系名称
  email: string // 联系邮箱
  phone: string // 联系电话
  app: {
    limit: number // 应用上限
    own: number // 所属应用数量
  }
  org: {
    limit: number // 组织上限
    own: number // 所属组织数量
    join: number // 协作组织数量
  }
}

interface UserDocument extends db.Document, IUser {}

const userSchema = new db.Schema({
  email: { type: String, index: { unique: true } },
  phone: { type: String, index: { unique: true } },
  name: { type: String, index: { unique: true }, required: true },
  rawName: { type: String, required: true },
  level: { type: Number, default: 0 },
  createTime: {
    type: Date,
    default: new Date()
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
  dev: {
    type: {
      name: String,
      email: String,
      phone: String,
      app: {
        type: {
          limit: { type: Number, default: 5 },
          own: { type: Number, default: 0 },
          join: { type: Number, default: 0 }
        }
      },
      org: {
        type: {
          limit: { type: Number, default: 5 },
          own: { type: Number, default: 0 },
          join: { type: Number, default: 0 }
        }
      }
    }
  }
})

const userDB = db.model<UserDocument>('users', userSchema)

/**
 * 添加用户
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

export async function addDeveloper(id: string, name: string, email: string, phone: string): Promise<void> {
  await userDB.findByIdAndUpdate(id, {
    level: 1,
    dev: {
      name: name,
      email: email,
      phone: phone,
      app: { limit: 5, own: 0, join: 0 },
      org: { limit: 5, own: 0, join: 0 }
    }
  })
}

export async function checkIfExistByLevel(level: number): Promise<boolean> {
  return (await userDB.findOne({ level: level }).countDocuments()) !== 0
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
 *
 * @param {string} name 用户名
 * @returns {User | null} 用户信息
 */
export async function getByName(name: string): Promise<UserDocument | null> {
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

export async function updateDevInfo(id: string, name: string, email: string, phone: string) {
  await userDB.findByIdAndUpdate(id, { $set: { 'dev.name': name, 'dev.email': email, 'dev.phone': phone } })
}

export async function updateDev(id: string, type: string, operator: number): Promise<void> {
  switch (type) {
    case 'app.own': {
      await userDB.findByIdAndUpdate(id, { $inc: { 'dev.app.own': operator } })
      break
    }
    case 'app.member': {
      await userDB.findByIdAndUpdate(id, { $inc: { 'dev.app.member': operator } })
      break
    }
    case 'org.own': {
      await userDB.findByIdAndUpdate(id, { $inc: { 'dev.org.own': operator } })
      break
    }
    case 'org.member': {
      await userDB.findByIdAndUpdate(id, { $inc: { 'dev.org.member': operator } })
      break
    }
  }
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

export async function updateLevel(id: string, level: number): Promise<void> {
  await userDB.findByIdAndUpdate(id, { level: level })
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
export async function updateInfo(id: string, info: Partial<IUserInfo>): Promise<void> {
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
