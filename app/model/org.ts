import { ObjectId } from 'bson'

import * as db from '../../lib/mongo'
import { User } from './user'

export interface Organization extends db.Document {
  name: string // 组织名，全小写，用于索引
  rawName: string // 原始组织名
  createTime: Date // 注册时间
  _owner: User // 组织所有人
  _members: User[] // 组织成员
}

const orgSchema = new db.Schema({
  name: { type: String, index: { unique: true }, required: true },
  rawName: { type: String, required: true },
  createTime: { type: Date, default: new Date() },
  _owner: { type: ObjectId, ref: 'users', index: true, required: true },
  _members: [{ type: ObjectId, ref: 'users', index: true }]
})

const orgDB = db.model<Organization>('orgs', orgSchema)

/**
 * 创建组织
 *
 * @param {string} userId 用户ObjectId
 * @param {string} name 组织名
 */
export async function add(userId: string, name: string): Promise<void> {
  await orgDB.create({ name: name.toLowerCase(), rawName: name, _owner: userId })
}

export async function getByName(name: string): Promise<Organization | null> {
  return await orgDB.findOne({ name: name.toLowerCase() })
}
