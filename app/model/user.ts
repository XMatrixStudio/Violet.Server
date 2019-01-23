import * as db from '../../lib/mongo'

export interface User extends db.Document {
  email: string // 登录邮箱，全小写
  name: string // 用户名，全小写
  nickname: string // 原始用户名
  secure: {
    password: string
    salt: string
    valid: boolean
  }
  info: {
    avatar: string
  }
}

const userSchema = new db.Schema({
  email: String,
  name: String,
  nickname: String,
  secure: {
    password: String,
    salt: String,
    valid: Boolean
  },
  info: {
    avatar: String
  }
})

const userDB = db.model<User>('users', userSchema)

export const add = async (email: String, name: String, password: String, salt: String): Promise<string | null> => {
  try {
    const user = await userDB.create({
      email: email,
      name: name.toLowerCase(),
      nickname: name,
      secure: {
        password: password,
        salt: salt
      }
    })
    return user.id
  } catch (err) {
    return null
  }
}

export const getByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await userDB.findOne({
      email: email.toLowerCase()
    })
    return user
  } catch (err) {
    return null
  }
}

export const getByName = async (name: string): Promise<User | null> => {
  try {
    const user = await userDB.findOne({
      name: name.toLowerCase()
    })
    return user
  } catch (err) {
    return null
  }
}
