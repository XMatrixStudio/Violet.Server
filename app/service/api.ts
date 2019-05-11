import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as crypto from '../../lib/crypto'
import * as appModel from '../model/app'
import * as userModel from '../model/user'

export async function getSecret(appId: string, appKey: string): Promise<ApiGetUtilSecret.ResBody> {
  const enc = crypto.encrypt(Date.now().toString(), appKey)
  const hash = crypto.hash(appId + enc + appKey)
  return {
    appSecret: `${appId}&${enc}&${hash}`
  }
}

export async function getToken(code: string, appSecret: string): Promise<ApiPostVerifyToken.ResBody> {
  const app = await readSecret(appSecret)
  const data = crypto.readCode(code)
  assert(app._id.toString() === data.appId, 'invalid_code')
  return {
    token: crypto.generateToken(data.userId, data.appId),
    userId: crypto.generateOpenId(data.userId, data.appId)
  }
}

export async function getUser(token: string, appSecret: string): Promise<ApiGetUser.ResBody> {
  const app = await readSecret(appSecret)
  const data = crypto.readToken(token)
  assert(app._id.toString() === data.appId, 'invalid_token')
  const user = await userModel.getById(data.userId)
  assert(user, 'invalid_token')
  const auth = await userModel.getAuthById(data.userId, data.appId)
  assert(auth && Date.now() - auth.time.getTime() < auth.duration * 1000 * 60 * 60 * 24, 'timeout_token')
  let res: ApiGetUser.ResBody = {
    id: user!._id,
    avatar: user!.info.avatar,
    nickname: user!.info.nickname
  }
  if (_.includes(auth!.scope, 'info')) {
    res = Object.assign(res, user!.info)
  }
  return res
}

async function readSecret(secret: string): Promise<appModel.IApp> {
  const data = secret.split('&') // AppId & TimeEncrypt & Hash
  assert(data.length === 3, 'invalid_app_secret') // 检测数据完整性
  const app = await appModel.getById(data[0])
  assert(app, 'invalid_app_secret')
  assert(crypto.hash(data[0] + data[1] + app!.key) === data[2], 'invalid_app_secret') // 检测数据合法性
  const validTimeStr = crypto.decrypt(data[1], app!.key) // 解密数据
  assert(validTimeStr, 'invalid_app_secret') // 检测解密状态
  const validTime = new Date(parseInt(validTimeStr))
  assert(!Number.isNaN(validTime.getTime()), 'invalid_app_secret') // 检测时间合法性
  assert(Date.now() - validTime.getTime() < 1000 * 60, 'invalid_app_secret') // 检测密钥有效期
  return app!
}
