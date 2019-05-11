import * as crypto from '../../lib/crypto'

export async function getToken(code: string, appSecret: string) {
  crypto.readCode(code)
}

async function readSecret(secret: string) {
  const arr = secret.split('&')
  // assert(data.length === 3, 'invalid_clientSecret') // 检测数据完整性
  // let client = await clientModel.getById(data[0])
  // assert(client, 'invalid_clientSecret') // 检测是否存在对应的ClientId
  // assert(util.hash(data[1] + client.key) === data[2], 'invalid_clientSecret') // 检测数据合法性
  // let validTime = util.decrypt(data[1], client.key) // 解密数据
  // assert(validTime, 'invalid_clientSecret') // 检测解密状态
  // validTime = new Date(parseInt(validTime))
  // assert(!Number.isNaN(validTime.getTime()), 'invalid_clientSecret') // 检测时间合法性
  // assert((new Date().getTime()) - validTime < 1000 * 60, 'invalid_clientSecret') // 检测密钥有效期
  // return client
}
