import { ObjectId } from 'bson'

import * as db from '../../lib/mongo'
import { User } from './user'

interface Level extends db.Document {
  level: number // 用户级别
  appLimit: number // 可创建的App的数量上限
  orgLimit: number // 可创建的组织的数量上限
  adminPermission: boolean // 管理员权限
}

const levelSchema = new db.Schema({
  level: { type: Number, index: { unique: true }, required: true },
  appLimit: { type: Number, required: true },
  orgLimit: { type: Number, required: true },
  adminPermission: { type: Boolean, default: false }
})

export interface LevelRequest extends db.Document {
  _user: User // 用户信息
  level: number // 申请的用户等级
  reason: string // 申请理由
  time: Date // 申请时间
  state: 0 | 1 | 2 | 3 // 申请状态: 0 - 待审核, 1 - 已通过, 2 - 已拒绝, 3 - 已关闭
}

const levelRequestSchema = new db.Schema({
  _user: { type: ObjectId, ref: 'users', index: true, required: true },
  level: { type: Number, required: true },
  reason: { type: String, required: true },
  time: { type: Date, default: new Date() },
  state: { type: Number, default: 0 }
})

const levelDB = db.model<Level>('levels', levelSchema)
const levelRequestDB = db.model<LevelRequest>('levels.requests', levelRequestSchema)

/**
 * 添加申请
 *
 * @param {string} userId 用户ObjectId
 * @param {number} level 申请的等级
 * @param {string} reason 申请理由
 */
export async function addRequest(userId: string, level: number, reason: string): Promise<void> {
  await levelRequestDB.create({ _user: userId, level: level, reason: reason })
}

/**
 * 获取所有用户等级信息
 *
 * @return {Level[]} 所有等级信息
 */
export async function getLevels(): Promise<Level[]> {
  return await levelDB.find({})
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
  return await levelRequestDB.findOne({ _user: userId, state: 0 })
}

/**
 * 获取申请数量
 *
 * @param {Partial<{ _user: string; state: number }>} option 筛选选项
 */
export async function getRequestsCount(option: Partial<{ _user: string; state: number }> = {}): Promise<number> {
  return await levelRequestDB.countDocuments(option)
}

/**
 * 获取申请
 *
 * @param {number} page 页数
 * @param {number} limit 每页数量限制
 * @param {Partial<{ _user: string; state: number }>} option 筛选选项
 */
export async function getRequests(
  page: number,
  limit: number,
  option: Partial<{ _user: string; state: number }> = {}
): Promise<LevelRequest[]> {
  return await levelRequestDB
    .find(option)
    .populate('_user', 'rawName level')
    .sort({ time: -1 })
    .skip(limit * (page - 1))
    .limit(limit)
}

/**
 * 初始化等级系统
 */
export async function init(): Promise<void> {
  await levelDB.create(
    { level: 0, appLimit: 0, orgLimit: 0 },
    { level: 1, appLimit: 5, orgLimit: 5 },
    { level: 50, appLimit: 5, orgLimit: 5, adminPermission: true },
    { level: 99, appLimit: -1, orgLimit: -1, adminPermission: true }
  )
}
