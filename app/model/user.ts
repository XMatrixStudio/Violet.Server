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
  info: {
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
  secure: {
    password: string // 经过加盐与多次SHA512的密码
    salt: string // 盐
    errorCount: number // 连续登陆失败的次数
    errorTime: Date // 第一次登陆失败的时间
  }
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
 * @return {boolean} 是否添加成功
 */
export async function add(data: Record<'email' | 'phone' | 'name' | 'nickname' | 'password' | 'salt', string>): Promise<boolean> {
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
  return user !== null
}

export async function getByEmail(email: string): Promise<User | null> {
  try {
    const user = await userDB.findOne({
      email: email.toLowerCase()
    })
    return user
  } catch (err) {
    console.log(err)
    return null
  }
}

/**
 * 获取用户信息
 *
 * @param {string} id ObjectId
 */
export async function getById(id: string): Promise<User | null> {
  return await userDB.findById(id)
}

export async function getByName(name: string): Promise<User | null> {
  try {
    const user = await userDB.findOne({
      name: name.toLowerCase()
    })
    return user
  } catch (err) {
    console.log(err)
    return null
  }
}

export async function getByPhone(phone: string): Promise<User | null> {
  try {
    return await userDB.findOne({
      phone: phone
    })
  } catch (err) {
    console.log(err)
    return null
  }
}
