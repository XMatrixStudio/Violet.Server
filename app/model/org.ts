import { ObjectId } from 'bson'

import db from '.'
import { IUser } from './user'

export interface IOrg {
  _id: any // ObjectId
  name: string // 组织名，全小写，用于索引
  rawName: string // 原始组织名
  createTime: Date // 注册时间
  members: IOrgMember[]
  contact: {
    name: string
    email: string
    phone: string
  }
  info: {
    avatar: string
    description: string
    location: string
  }
  app: {
    limit: number // 应用上限
    own: number // 所属应用数量
  }
}

export interface IOrgMember {
  _user: IUser
  role: number // 角色：0 - 普通成员，1 - 管理员，2 - 所有人
}

interface OrgDocument extends db.Document, IOrg {}

const orgSchema = new db.Schema({
  members: [
    {
      _user: { type: ObjectId, ref: 'users', index: true, required: true },
      role: { type: Number, default: 0 }
    }
  ],
  name: { type: String, index: { unique: true }, required: true },
  rawName: { type: String, required: true },
  createTime: { type: Date, default: new Date() },
  contact: {
    type: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    required: true
  },
  info: {
    type: {
      avatar: String,
      description: String,
      location: String
    }
  },
  app: {
    type: { limit: Number, own: Number },
    default: { limit: 5, own: 0 }
  }
})

const orgDB = db.model<OrgDocument>('orgs', orgSchema)

/**
 * 创建组织
 * @param {string} userId 所有人ObjectId
 * @param {string} name 组织名
 * @param {string} description 简介
 * @param {string} contact 联系人姓名
 * @param {string} email 联系人邮箱
 * @param {string} phone 联系人电话
 */
export async function add(userId: string, name: string, description: string, contact: string, email: string, phone: string) {
  await orgDB.create({
    members: [{ _user: userId, role: 2 }],
    name: name.toLowerCase(),
    rawName: name,
    contact: {
      name: contact,
      email: email,
      phone: phone
    },
    info: {
      description: description
    }
  })
}

/**
 * 获取指定名字的组织
 * @param {string} name 组织名
 */
export async function getByName(name: string): Promise<IOrg | null> {
  return await orgDB.findOne({ name: name.toLowerCase() })
}

/**
 * 获取指定用户的组织数量
 * @param {string} userId 用户ObjectId
 */
export async function getCountByUserId(userId: string): Promise<number> {
  return await orgDB.countDocuments({ 'members._user': userId })
}

/**
 * 获取指定用户的组织列表
 * @param {string} userId 用户ObjectId
 * @param {string} page 资源页码
 * @param {string} limit 资源每页数量
 */
export async function getListByUserId(userId: string, page: number, limit: number): Promise<IOrg[]> {
  return await orgDB
    .find({ 'members._user': userId })
    .skip(limit * (page - 1))
    .limit(limit)
}

/**
 * 判断组织是否包含该成员
 * @param {string} id 组织ObjectId
 * @param {string} userId 用户ObjectId
 */
export async function isHasMember(id: string, userId: string): Promise<boolean> {
  return (await orgDB.countDocuments({ _id: id, 'members._user': userId })) !== 0
}
