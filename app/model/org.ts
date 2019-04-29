import { ObjectId } from 'bson'

import db from '.'
import { IUser } from './user'

export interface IOrg {
  _id: any // ObjectId
  name: string // 组织名，全小写，用于索引
  rawName: string // 原始组织名
  createTime: Date // 注册时间
  members: IOrgMember[]
  dev: IOrgDev
  info: IOrgInfo
  permission: {
    appRole: number // 添加应用、删除应用的最低权限
    memberRole: number // 删除成员、更改成员等级的最低权限
    inviteRole: number // 邀请成员的最低权限
  }
}

export interface IOrgDev {
  appLimit: number // 应用上限
  appOwn: number // 所属应用数量
  memberLimit: number // 成员上限
}

export interface IOrgInfo {
  avatar: string
  contact: string
  description: string
  displayName: string // 组织显示名
  email: string
  location: string
  phone: string
  url: string
}

export interface IOrgMember {
  _user: IUser
  role: number // 角色：0 - 普通成员，1 - 管理员，2 - 创建者
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
  dev: {
    type: { appLimit: Number, appOwn: Number, memberLimit: Number },
    default: { appLimit: 5, appOwn: 0, memberLimit: 5 }
  },
  info: {
    type: {
      avatar: String,
      contact: String,
      description: String,
      displayName: String,
      email: String,
      location: String,
      phone: String,
      url: String
    }
  },
  permission: {
    type: {
      appRole: Number,
      memberRole: Number,
      inviteRole: Number
    },
    default: { appRole: 1, memberRole: 1, inviteRole: 1 }
  }
})

const orgDB = db.model<OrgDocument>('orgs', orgSchema)

/**
 * 创建组织
 * @param {string} userId 所有人ObjectId
 * @param {string} name 组织名
 * @param {string} displayName 组织显示名
 * @param {string} description 简介
 * @param {string} contact 联系人姓名
 * @param {string} email 联系人邮箱
 * @param {string} phone 联系人电话
 * @returns {string} 组织ObjectId
 */
export async function add(
  userId: string,
  name: string,
  displayName: string,
  description: string,
  contact: string,
  email: string,
  phone: string
): Promise<string> {
  const org = await orgDB.create({
    members: [{ _user: userId, role: 2 }],
    name: name.toLowerCase(),
    rawName: name,
    info: {
      contact: contact,
      description: description,
      displayName: displayName,
      email: email,
      phone: phone
    }
  })
  return org._id
}

export async function addMember(id: string, userId: string) {
  await orgDB.updateOne({ _id: id }, { $push: { members: { _user: userId } } })
}

export async function getById(id: string): Promise<IOrg | null> {
  return await orgDB.findById(id)
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

export async function getUserPermission(id: string, userId: string): Promise<Record<'app' | 'invite' | 'member', boolean>> {
  const org = await orgDB.findById(id, { 'members._user': userId })
  return {
    app: org!.permission.appRole <= org!.members[0].role,
    invite: org!.permission.inviteRole <= org!.members[0].role,
    member: org!.permission.memberRole <= org!.members[0].role
  }
}

/**
 * 判断组织是否包含该成员
 * @param {string} id 组织ObjectId
 * @param {string} userId 用户ObjectId
 */
export async function isHasMember(id: string, userId: string): Promise<boolean> {
  return (await orgDB.countDocuments({ _id: id, 'members._user': userId })) !== 0
}

export async function setAvatar(id: string, avatar: string) {
  await orgDB.updateOne({ _id: id }, { 'info.avatar': avatar })
}

export async function updateDevState(id: string, type: 'appOwn' | 'appLimit' | 'memberLimit', offset: number) {
  switch (type) {
    case 'appLimit':
      await orgDB.updateOne({ _id: id }, { $inc: { 'dev.appLimit': offset } })
      break
    case 'appOwn':
      await orgDB.updateOne({ _id: id }, { $inc: { 'dev.appOwn': offset } })
      break
    case 'memberLimit':
      await orgDB.updateOne({ _id: id }, { $inc: { 'dev.memberLimit': offset } })
      break
  }
}
