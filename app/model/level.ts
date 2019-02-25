import * as db from '../../lib/mongo'
import { ObjectId } from 'bson'

interface Level extends db.Document {
  level: number // 用户级别
  appLimit: number // 可创建的App的数量上限
  adminPermission: boolean // 管理员权限
}

const levelSchema = new db.Schema({
  level: { type: Number, index: { unique: true }, required: true },
  appLimit: { type: Number, required: true },
  adminPermission: { type: Boolean, default: false }
})

interface LevelRequest extends db.Document {
  userId: ObjectId // 用户ObjectId
  level: number // 申请的用户等级
  reason: string // 申请理由
  time: Date // 申请时间
  state: number // 申请状态: 0 - 待审核, 1 - 已通过, 2 - 已拒绝, 3 - 已关闭
}

const levelRequestSchema = new db.Schema({
  userId: { type: ObjectId, index: true, required: true },
  level: { type: Number, required: true },
  reason: { type: String, required: true },
  time: { type: Date, default: new Date() },
  state: { type: Number, default: 0 }
})

const levelDB = db.model<Level>('levels', levelSchema)
const levelRequestDB = db.model<LevelRequest>('levels.requests', levelRequestSchema)

export async function addRequest(userId: string, level: number, reason: string): Promise<void> {
  await levelRequestDB.create({ userId: userId, level: level, reason: reason })
}

/**
 * 获取等级信息
 *
 * @param {number} level 等级
 * @return {Level | null} 等级信息
 */
export async function getByLevel(level: number): Promise<Level | null> {
  return await levelDB.findOne({ level: level })
}

/**
 * 获取用户待审核的申请
 *
 * @param {string} userId 用户ObjectId
 */
export async function getOpenRequestByUserId(userId: string): Promise<LevelRequest | null> {
  return await levelRequestDB.findOne({ userId: userId, state: 0 })
}

/**
 * 初始化等级系统
 */
export async function init(): Promise<void> {
  await levelDB.create(
    { level: 0, appLimit: 0 },
    { level: 1, appLimit: 5 },
    { level: 50, appLimit: 5, adminPermission: true },
    { level: 99, appLimit: -1, adminPermission: true }
  )
}
