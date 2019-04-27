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
    assert(user.dev!.app.limit > user.dev!.app.own, 'limit_apps')
    id = await appModel.addUser(userId, name, displayName, description, type, url, callbackHosts)
    await userModel.updateDevState(userId, 'app.own', 1)
  } else {
    const org = await orgModel.getByName(owner)
    assert(org && (await orgModel.isHasMember(org._id, userId)), 'not_exist_owner')
    assert(org!.app.limit > org!.app.own, 'limit_apps')
    id = await appModel.addOrg(org!._id, name, displayName, description, type, url, callbackHosts)
    await orgModel.updateDevState(org!._id, 'app.own', 1)
  }
  if (avatar) {
    await file.upload(id + '.png', Buffer.from(avatar.replace('data:image/png;base64,', ''), 'base64'))
    await appModel.setAvatar(id, config!.file.cos.url + id + '.png')
  }
}

/**
 * 获取应用的基本信息
 * @param {OnlyOne<Record<'id' | 'name', string>>} a 应用ObjectId或应用名
 */
export async function getAppBaseInfo(a: OnlyOne<Record<'id' | 'name', string>>): Promise<GetAppsByNameOrId.ResBody> {
  let app: appModel.IApp | null
  if (a.id !== undefined) app = await appModel.getByIdWithOwner(a.id)
  else app = await appModel.getByNameWithOwner(a.name)
  assert(app, 'not_exist_app')
  app!.info.avatar = app!.info.avatar || config!.file.cos.url + config!.file.cos.default
  return {
    id: app!._id,
    name: app!.rawName,
    owner: {
      name: app!._owner.rawName,
      type: app!.__owner === 'users' ? 'user' : 'org'
    },
    createTime: app!.createTime,
    type: app!.type,
    state: app!.state,
    info: app!.info
  }
}
