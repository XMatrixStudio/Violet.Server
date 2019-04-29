import { ObjectId } from 'bson'

import db from '.'
import { IOrg } from './org'
import { IUser } from './user'

export interface IRequest {
  _id: any // ObjectId
  _target: IUser | IOrg // 目标
  type: RequestType // 申请类型
  state: number // 申请状态: 0 - 待审核, 1 - 已通过, 2 - 已拒绝
  remark: string // 备注
  time: Date // 申请时间
}

export enum RequestType {
  LevelDev = 0, // 成为开发者
  LevelAdmin = 1, // 成为管理员
  UserAppLimit = 10, // 提高用户应用上限
  UserOrgLimit = 11, // 提高用户组织上限
  OrgAppLimit = 20 //  提高组织应用上限
}

export interface RequestDocument extends db.Document, IRequest {}

const requestSchema = new db.Schema({
  _target: { type: ObjectId, refPath: '__target', required: true },
  __target: { type: String, required: true, enum: ['users', 'orgs'] },
  type: { type: Number, required: true, index: true },
  remark: String,
  time: { type: Date, default: Date.now },
  state: { type: Number, default: 0, index: true }
})

const requestDB = db.model<RequestDocument>('requests', requestSchema)

export async function addUser(userId: string, type: RequestType, remark?: string, state: number = 0) {
  await requestDB.create({ _target: userId, __target: 'users', type: type, remark: remark, state: state })
}

export async function addOrganization(orgId: string, type: RequestType, remark?: string, state: number = 0) {
  await requestDB.create({ _target: orgId, __target: 'orgs', type: type, remark: remark, state: state })
}

export async function getList(page: number, limit: number, option: Partial<IRequest>): Promise<IRequest[]> {
  return await requestDB
    .find(option)
    .populate('_target', 'rawName')
    .sort({ time: -1 })
    .skip(limit * (page - 1))
    .limit(limit)
}

export async function getListCount(option: Partial<IRequest>): Promise<number> {
  return await requestDB.countDocuments(option)
}

export async function getOpenListByTarget(targetId: string): Promise<IRequest[]> {
  return await requestDB.find({ _target: targetId, state: 0 })
}

export async function isExistByTargetAndType(targetId: string, type: RequestType): Promise<boolean> {
  return (await requestDB.countDocuments({ _target: targetId, type: type, state: 0 })) !== 0
}
