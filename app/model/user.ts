import * as db from '../../lib/mongo'

export interface User extends db.Document {
  email: string // 用户登陆邮箱，全小写
  phone: string // 用户登陆手机，11位
  name: string // 用户名，全小写，用于索引
  rawName: string // 原始用户名
  nickname: string // 昵称
  secure: {
    password: string // 经过加盐与多次SHA512的密码
    salt: string // 盐
  }
  info: {
    avatar: string // 头像URL
  }
}

const userSchema = new db.Schema({
  email: { type: String, index: true },
  phone: { type: String, index: true },
  name: { type: String, index: true, required: true },
  rawName: { type: String, required: true },
  nickname: String,
  secure: {
    type: {
      password: String,
      salt: String
    },
    required: true
  },
  info: {
    avatar: String
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
  try {
    const user = await userDB.create({
      email: data.email,
      phone: data.phone,
      name: data.name.toLowerCase(),
      rawName: data.name,
      nickname: data.nickname,
      secure: {
        password: data.password,
        salt: data.salt
      }
    })
    return user !== null
  } catch (err) {
    console.log(err)
    return false
  }
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
