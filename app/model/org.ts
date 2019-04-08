import { ObjectId } from 'bson'

import db from '.'
import { IUser } from './user'

export interface IOrganization {
  _id: any // ObjectId
  name: string // 组织名，全小写，用于索引
  rawName: string // 原始组织名
  createTime: Date // 注册时间
  _owner: IUser // 组织所有人
  contact: {
    name: string
    email: string
    phone: string
  }
  info: {
    avatar: string
    description: string
  }
}

interface OrganizationDocument extends db.Document, IOrganization {}

const orgSchema = new db.Schema({
  _owner: { type: ObjectId, ref: 'users', index: true, required: true },
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
      description: String
    }
  }
})

const orgDB = db.model<OrganizationDocument>('orgs', orgSchema)

export async function add(userId: string, name: string, description: string, contact: string, email: string, phone: string) {
  await orgDB.create({
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

export async function getByName(name: string): Promise<IOrganization | null> {
  return await orgDB.findOne({ name: name.toLowerCase() })
}

export async function getCountByUserId(userId: string): Promise<number> {
  return await orgDB.find({ _owner: userId }).countDocuments()
}

export async function getListByUserId(userId: string, page: number, limit: number): Promise<IOrganization[]> {
  return await orgDB
    .find({ _owner: userId })
    .skip(limit * (page - 1))
    .limit(limit)
}
