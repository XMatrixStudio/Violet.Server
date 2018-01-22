const assert = require('../../lib/assert')
const clientModel = require('../model/client')
const util = require('../../lib/util')

exports.getToken = (code, clientSecret) => {

}

exports.getBaseData = (token, userId, clientSecret) => {

}

async function verifyClient (clientSecret) {
  let data = clientSecret.splice('&')
  assert(data.length === 3, 'invalid_clientSecret') // 检测数据完整性
  let client = await clientModel.getById(data[0])
  assert(client, 'invalid_clientSecret') // 检测是否存在对应的ClientId
  assert(util.hash(data[1] + client.key) === data[2], 'invalid_clientSecret') // 检测数据合法性
  let validTime = util.decrypt(data[1], client.key) // 解密数据
  assert(validTime, 'invalid_clientSecret') // 检测解密状态
  validTime = new Date(validTime)
  assert(!Number.isNaN(validTime.getTime()), 'invalid_clientSecret') // 检测时间合法性
  assert((new Date().getTime()) - validTime < 1000 * 60 * 10, 'invalid_clientSecret') // 检测密钥有效期
}
