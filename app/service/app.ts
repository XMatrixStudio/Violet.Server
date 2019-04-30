import * as assert from '../../lib/assert'
import * as file from '../../lib/file'
import * as util from '../../lib/util'
import config from '../config/config'
import * as appModel from '../model/app'
import * as orgModel from '../model/org'
import * as userModel from '../model/user'

/**
 * 创建应用
 * @param {string} userId 用户ObjectId
 * @param {string} name 应用名
 * @param {string} owner 所有人，即用户名或组织名
 * @param {string} description 简介
 * @param {number} type 类型
 * @param {string} url 主页
 * @param {string[]} callbackHosts 回调域数组
 * @param {string} avatar 头像的base64串
 */
export async function createApp(
  userId: string,
  name: string,
  displayName: string,
  owner: string,
  description: string,
  type: number,
  url: string,
  callbackHosts: string[],
  avatar?: string
) {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(!(await appModel.getByName(name)), 'exist_name')
  const user = await userModel.getByName(owner)
  let id: string
  if (user) {
    assert(user._id.toString() === userId, 'not_exist_owner')
    assert(user.dev!.appLimit > user.dev!.appOwn, 'limit_apps')
    id = await appModel.addUser(userId, name, displayName, description, type, url, callbackHosts)
    await userModel.updateDevState(userId, 'appOwn', 1)
  } else {
    const org = await orgModel.getByName(owner)
    assert(org && (await orgModel.isHasMember(org._id, userId)), 'not_exist_owner')
    assert(org!.dev.appLimit > org!.dev.appOwn, 'limit_apps')
    id = await appModel.addOrg(org!._id, name, displayName, description, type, url, callbackHosts)
    await orgModel.updateDevState(org!._id, 'appOwn', 1)
  }
  if (avatar) {
    await file.upload(id + '.png', Buffer.from(avatar.replace('data:image/png;base64,', ''), 'base64'))
    await appModel.setAvatar(id, config!.file.cos.url + id + '.png')
  }
}

export async function getAllInfo(userId: string, extId: string): Promise<GetAppsByExtId.ResBody> {
  let app: appModel.IApp | null
  if (extId[0] === '+') app = await appModel.getByIdWith(extId.substr(1), '_id rawName')
  else app = await appModel.getByNameWith(extId, '_id rawName')
  assert(app, 'not_exist_app')
  assert(!(app!.__owner === 'users' && app!._owner.toString() !== userId), 'not_owner')
  assert(await orgModel.isHasMember(app!.__owner, userId), 'not_owner')
  app!.info.avatar = app!.info.avatar || config!.file.cos.url + config!.file.cos.default.app
  return {
    id: app!._id,
    name: app!.rawName,
    owner: {
      id: app!._owner._id,
      name: app!._owner.rawName,
      type: app!.__owner === 'users' ? 'user' : 'org'
    },
    createTime: app!.createTime,
    key: app!.key,
    callbackHosts: app!.callbackHosts,
    state: app!.state,
    type: app!.type,
    info: app!.info
  }
}

export async function getBaseInfo(extId: string): Promise<GetAppsByExtId.ResBody> {
  let app: appModel.IApp | null
  if (extId[0] === '+') app = await appModel.getByIdWith(extId.substr(1), '_id rawName')
  else app = await appModel.getByNameWith(extId, '_id rawName')
  assert(app, 'not_exist_app')
  app!.info.avatar = app!.info.avatar || config!.file.cos.url + config!.file.cos.default.app
  return {
    id: app!._id,
    name: app!.rawName,
    owner: {
      id: app!._owner._id,
      name: app!._owner.rawName,
      type: app!.__owner === 'users' ? 'user' : 'org'
    },
    createTime: app!.createTime,
    type: app!.type,
    state: app!.state,
    info: app!.info
  }
}
