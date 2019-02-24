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
}

const levelRequestSchema = new db.Schema({
  userId: { type: ObjectId, index: { unique: true }, required: true },
  level: { type: Number, required: true },
  reason: { type: String, required: true }
})

// const levelDB = db.model<Level>('levels', levelSchema)
// const levelRequestDB = db.model<LevelRequest>('levels.requests', levelRequestSchema)
