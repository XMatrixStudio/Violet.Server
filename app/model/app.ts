import { ObjectId } from 'bson'

import { rand } from '../../lib/crypto'
import { IOrg } from './org'
import { IUser } from './user'
import db from '.'

export interface IApp {
  _id: any
  _owner: IUser | IOrg
  __owner: string
  name: string // 项目名，全小写
  rawName: string // 原始项目名
  createTime: Date // 创建时间
  type: number // 类型
  state: number // 状态，0 - 运行中，1 - 已暂停
  key: string // 密钥
  callbackHosts: string[] // 回调域
  info: {
    avatar: string
    description: string
    displayName: string
    url: string
  }
}

export interface AppDocument extends db.Document, IApp {}

const appSchema = new db.Schema({
  _owner: { type: ObjectId, refPath: '__owner', required: true },
  __owner: { type: String, required: true, enum: ['users', 'orgs'] },
  name: { type: String, index: true, required: true },
  rawName: { type: String, required: true },
  createTime: { type: Date, default: new Date() },
  type: { type: Number },
  state: { type: Number, default: 0 },
  key: { type: String, required: true },
  callbackHosts: [String],
  info: {
    type: {
      avatar: String,
      description: String,
      url: String
    }
  }
})

const appDB = db.model<AppDocument>('apps', appSchema)

/**
 * 添加组织应用
 * @param {string} orgId 组织ObjectId
 * @param {string} name 应用名
 * @param {string} displayName 显示名
 * @param {string} description 简介
 * @param {number} type 类型
 * @param {string} url 主页
 * @param {string[]} callbackHosts 回调域
 * @returns {string} 应用ObjectId
 */
export async function addOrg(
  orgId: string,
  name: string,
  displayName: string,
  description: string,
  type: number,
  url: string,
  callbackHosts: string[]
): Promise<string> {
  const app = await appDB.create({
    _owner: orgId,
    __owner: 'orgs',
    name: name.toLowerCase(),
    rawName: name,
    type: type,
    key: rand(200).substr(0, 24),
    callbackHost: callbackHosts,
    info: {
      description: description,
      displayName: displayName,
      url: url
    }
  })
  return app._id
}

/**
 * 添加用户应用
 * @param {string} userId 用户ObjectId
 * @param {string} name 应用名
 * @param {string} displayName 显示名
 * @param {string} description 简介
 * @param {number} type 类型
 * @param {string} url 主页
 * @param {string[]} callbackHosts 回调域
 * @returns {string} 应用ObjectId
 */
export async function addUser(
  userId: string,
  name: string,
  displayName: string,
  description: string,
  type: number,
  url: string,
  callbackHosts: string[]
): Promise<string> {
  const app = await appDB.create({
    _owner: userId,
    __owner: 'users',
    name: name.toLowerCase(),
    rawName: name,
    type: type,
    key: rand(200).substr(0, 24),
    callbackHosts: callbackHosts,
    info: {
      description: description,
      displayName: displayName,
      url: url
    }
  })
  return app._id
}

export async function getById(id: string): Promise<IApp | null> {
  return await appDB.findById(id)
}

/**
 * 获取指定Id的应用，同时连接Owner
 * @param {string} id 应用ObjectId
 * @returns {IApp | null} 应用信息
 */
export async function getByIdWith(id: string, populate: string): Promise<IApp | null> {
  return await appDB.findById(id).populate('_owner', populate)
}

/**
 * 获取指定应用名的应用
 * @param {string} name 应用名
 * @returns {IApp | null} 应用信息
 */
export async function getByName(name: string): Promise<IApp | null> {
  return await appDB.findOne({ name: name.toLowerCase() })
}

export async function getByNameWith(name: string, populate: string): Promise<IApp | null> {
  return await appDB.findOne({ name: name.toLowerCase() }).populate('_owner', populate)
}

/**
 * 获取指定应用名的应用，同时连接Owner
 * @param {string} name 应用名
 * @returns {IApp | null} 应用信息
 */
export async function getByNameWithOwner(name: string): Promise<IApp | null> {
  return await appDB.findOne({ name: name.toLowerCase() }).populate('_owner')
}

/**
 * 获取指定所有人的应用数量
 * @param {string} ownerId 用户ObjectId或组织ObjectId
 */
export async function getCountByOwner(ownerId: string): Promise<number> {
  return await appDB.countDocuments({ _owner: ownerId })
}

/**
 * 获取指定所有人的应用列表
 * @param {string} ownerId 用户ObjectId或组织ObjectId
 * @param {number} page 资源页码
 * @param {number} limit 资源每页数量
 * @returns {IApp[]} 应用列表
 */
export async function getListByOwner(ownerId: string, page: number, limit: number): Promise<IApp[]> {
  return await appDB
    .find({ _owner: ownerId })
    .skip((page - 1) * limit)
    .limit(limit)
}

/**
 * 更新应用头像
 * @param {string} id 应用ObjectId
 * @param {string} avatar 应用头像Url
 */
export async function setAvatar(id: string, avatar: string) {
  await appDB.updateOne({ _id: id }, { 'info.avatar': avatar })
}
