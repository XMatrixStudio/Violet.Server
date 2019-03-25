import { ObjectId } from 'bson'

import * as db from '../../lib/mongo'
import { User } from './user'

export interface Application extends db.Document {
  name: string // 项目名
  owner: string // 项目所有人
  createTime: Date // 创建时间
  key: string // 密钥
  callback: string // 回调地址
  info: {
    icon: string
    url: string
    description: string
  }
}

const appSchema = new db.Schema({
  name: { type: String, index: true, required: true },
  owner: { type: ObjectId, index: true, required: true },
  createTime: { type: Date, default: new Date() },
  key: { type: String, required: true },
  callback: String,
  info: {
    type: {
      icon: String,
      url: String,
      description: String
    }
  }
})

const appDB = db.model<Application>('apps', appSchema)
