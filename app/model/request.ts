import { ObjectId } from 'bson'

import db from '.'

export interface IRequest {
  _id: any // ObjectId
  targetId: ObjectId // 用户ObjectId或组织ObjectId
  type: number // 申请类型: 0 - 成为开发者, 1 - 成为管理员, 10 - 提高用户应用上限, 11 - 提高用户组织上限, 20 - 提高组织应用上限
  remark: string // 备注
  time: Date // 申请时间
  state: number // 申请状态: 0 - 待审核, 1 - 已通过, 2 - 已拒绝
}

export interface RequestDocument extends db.Document, IRequest {}

const requestSchema = new db.Schema({
  targetId: { type: ObjectId, required: true, index: true },
  type: { type: Number, required: true, index: true },
  remark: String,
  time: { type: Date, default: new Date() },
  state: { type: Number, default: 0 }
})

const requestDB = db.model<RequestDocument>('requests', requestSchema)

export async function add(targetId: string, type: number, remark?: string, state: number = 0) {
  await requestDB.create({ targetId: targetId, type: type, remark: remark, state: state })
}

export async function checkIfExistByTargetAndType(targetId: string, type: number): Promise<boolean> {
  return (await requestDB.findOne({ targetId: targetId, type: type, state: 0 }).count()) !== 0
}
