import { ObjectId } from 'bson'

import db from '.'
import { IOrganization } from './org'
import { IUser } from './user'

export interface IRequest {
  _id: any // ObjectId
  _target: IUser | IOrganization // 目标
  type: number // 申请类型: 0 - 成为开发者, 1 - 成为管理员, 10 - 提高用户应用上限, 11 - 提高用户组织上限, 20 - 提高组织应用上限
  state: number // 申请状态: 0 - 待审核, 1 - 已通过, 2 - 已拒绝
  remark: string // 备注
  time: Date // 申请时间
}

export interface RequestDocument extends db.Document, IRequest {}

const requestSchema = new db.Schema({
  _target: { type: ObjectId, refPath: '__target', required: true },
  __target: { type: String, required: true, enum: ['users', 'orgs'] },
  type: { type: Number, required: true, index: true },
  remark: String,
  time: { type: Date, default: new Date() },
  state: { type: Number, default: 0, index: true }
})

const requestDB = db.model<RequestDocument>('requests', requestSchema)

export async function add(targetId: string, type: number, remark?: string, state: number = 0) {
  await requestDB.create({ targetId: targetId, type: type, remark: remark, state: state })
}

export async function checkIfExistByTargetAndType(targetId: string, type: number): Promise<boolean> {
  return (await requestDB.findOne({ targetId: targetId, type: type, state: 0 }).count()) !== 0
}

export async function getLists(page: number, limit: number, option: Partial<IRequest>): Promise<IRequest[]> {
  return await requestDB
    .find(option)
    .populate('_target', 'rawName')
    .sort({ time: -1 })
    .skip(limit * (page - 1))
    .limit(limit)
}

export async function getListsCount(option: Partial<IRequest>): Promise<number> {
  return await requestDB.countDocuments(option)
}
