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
 * @param {string} homeUrl 主页
 * @param {string} callbackUrl 回调域
 * @param {string} avatar 头像的base64串
 */
export async function createApp(
  userId: string,
  name: string,
  owner: string,
  description: string,
  type: number,
  homeUrl: string,
  callbackUrl: string,
  avatar?: string
) {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(!(await appModel.getByName(name)), 'exist_name')
  const user = await userModel.getByName(owner)
  let id: string
  if (user) {
    assert(user._id === userId, 'not_exist_owner')
    assert(user.dev!.app.limit > user.dev!.app.own, 'limit_apps')
    id = await appModel.addUser(userId, name, description, type, homeUrl, callbackUrl)
  } else {
    const org = await orgModel.getByName(owner)
    assert(org && (await orgModel.isHasMember(org._id, userId)), 'not_exist_owner')
    assert(org!.app.limit > org!.app.own, 'limit_apps')
    id = await appModel.addOrg(org!._id, name, description, type, homeUrl, callbackUrl)
  }
  if (avatar) {
    console.log('error')
    await file.upload(id + '.jpg', Buffer.from(avatar.replace('data:image/jpeg;base64,', ''), 'base64'))
    await appModel.setAvatar(id, config!.file.cos.url + id + '.jpg')
  }
}

export async function getApp(userId: string | undefined, appName: string) {
  let user: userModel.IUser | undefined = undefined
  if (userId !== undefined) user = (await userModel.getById(userId))!
  const app = await appModel.getByName(appName)
  assert(app, 'not_exist_app')
  if (user === undefined || userId != app!._owner._id) {
    return {
      name: app!.rawName,
      createTime: app!.createTime,
      type: app!.type,
      state: app!.state,
      info: app!.info
    }
  } else {
    return {
      name: app!.rawName,
      createTime: app!.createTime,
      type: app!.type,
      state: app!.state,
      key: app!.key,
      callback: app!.callback,
      info: app!.info
    }
  }
}
