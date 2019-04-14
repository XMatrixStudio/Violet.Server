import * as assert from '../../lib/assert'
import * as file from '../../lib/file'
import * as util from '../../lib/util'
import config from '../config/config'
import * as appModel from '../model/app'
import * as orgModel from '../model/org'
import * as userModel from '../model/user'

export async function createApp(
  userId: string,
  name: string,
  owner: string,
  description: string,
  type: number,
  homeUrl: string,
  callbackUrl: string,
  avatar: string
) {
  assert(!util.isReservedUsername(name), 'reserved_name')
  assert(!(await appModel.getByName(name)), 'exist_name')
  const user = await userModel.getByName(owner)
  if (user) {
    assert(user._id === userId, 'not_exist_owner')
    assert(user.dev!.app.limit > user.dev!.app.own, 'limit_apps')
    owner = user._id
  } else {
    const org = await orgModel.getByName(name)
    assert(org, 'not_exist_owner')
    assert(org!.app.limit > org!.app.own, 'limit_apps')
    owner = org!._id
  }
  const id = await appModel.add(name, owner, description, type, homeUrl, callbackUrl)
  await file.upload(id + '.jpg', Buffer.from(avatar.replace('data:image/jpeg;base64,', ''), 'base64'))
  await appModel.setAvatar(id, config!.file.cos.url + id + '.jpg')
}
