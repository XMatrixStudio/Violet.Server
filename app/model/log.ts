import { ObjectId } from 'bson'

import db from '.'
import { IOrg } from './org'
import { IUser } from './user'

interface ILog {
  _id: any
  _target: IUser | IOrg
  login: {
    ip: string
    time: Date
  }[]
  password: {
    time: Date
  }[]
}

interface LogDocument extends db.Document, ILog {}

const logSchema = new db.Schema({
  _target: { type: ObjectId, refPath: '__target', required: true },
  __target: { type: String, required: true, enum: ['users', 'orgs'] },
  login: [
    {
      ip: String,
      time: { type: Date, default: Date.now }
    }
  ],
  password: [
    {
      time: { type: Date, default: Date.now }
    }
  ]
})

const logDB = db.model<LogDocument>('logs', logSchema)

/**
 * 添加用户日志项
 * @param {string} userId 用户ObjectId
 */
export async function addUser(userId: string): Promise<string> {
  const log = await logDB.create({ _target: userId, __target: 'users' })
  return log._id
}

export async function addLogin(userId: string, ip: string) {
  await logDB.updateOne({ _target: userId }, { $push: { login: { ip: ip } } })
}

export async function addPasswordChange(userId: string) {
  await logDB.updateOne({ _target: userId }, { $push: { password: {} } })
}

export async function getUserLog(userId: string): Promise<ILog | null> {
  return await logDB.findOne({ _target: userId }, { login: { $slice: -3 }, password: { $slice: -1 }, 'login._id': 0 })
}
