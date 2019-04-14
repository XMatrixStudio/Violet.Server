import { ObjectId } from 'bson'

import { rand } from '../../lib/crypto'
import { IOrganization } from './org'
import { IUser } from './user'
import db from '.'

export interface IApplication {
  _id: any
  _owner: IUser | IOrganization
  name: string // 项目名，全小写
  rawName: string // 原始项目名
  createTime: Date // 创建时间
  type: number
  key: string // 密钥
  callback: string // 回调地址
  info: {
    avatar: string
    description: string
    url: string
  }
}

export interface ApplicationDocument extends db.Document, IApplication {}

const appSchema = new db.Schema({
  _owner: { type: ObjectId, refPath: '__owner', required: true },
  __owner: { type: String, required: true, enum: ['users', 'orgs'] },
  name: { type: String, index: true, required: true },
  rawName: { type: String, required: true },
  createTime: { type: Date, default: new Date() },
  type: { type: Number },
  key: { type: String, required: true },
  callback: String,
  info: {
    type: {
      avatar: String,
      description: String,
      url: String
    }
  }
})

const appDB = db.model<ApplicationDocument>('apps', appSchema)

export async function add(
  name: string,
  owner: string,
  description: string,
  type: number,
  homeUrl: string,
  callbackUrl: string
): Promise<string> {
  const app = await appDB.create({
    _owner: owner,
    name: name.toLowerCase(),
    rawName: name,
    type: type,
    key: rand(200).substr(0, 24),
    callback: callbackUrl,
    info: {
      description: description,
      url: homeUrl
    }
  })
  return app._id
}

export async function getByName(name: string): Promise<IApplication | null> {
  return await appDB.findOne({ name: name.toLowerCase() })
}

export async function setAvatar(id: string, avatar: string) {
  await appDB.update({ _id: id }, { $set: { 'info.avatar': avatar } })
}
