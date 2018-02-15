const assert = require('../../lib/assert')
const clientModel = require('../model/client')
const util = require('../../lib/util')
const userService = require('../service/user')
const authService = require('../service/auth')

module.exports = {
  getToken: getToken,
  getBaseData: getBaseData,
  generateCode: generateCode
}

async function getToken (code, clientSecret) {
  let client = await readSecret(clientSecret)
  let data = readCode(code)
  assert(client.id === data.clientId, 'invalid_code') // 检测 code 与 clientSecret 是否匹配
  return generateToken(data.userId, data.clientId)
}

async function getBaseData (token, userId, clientSecret) {
  let client = await readSecret(clientSecret)
  let data = readToken(token)
  assert(client.id === data.clientId, 'invalid_token') // 检测 token 与 clientSecret 是否匹配
  assert(data.userId === userId, 'invalid_token') // 检测 userId 与 token 是否匹配
  assert(await authService.get(userId, client.id), 'invalid_token') // 检测是否授权
  let userData = await userService.getBaseInfo(data.userId)
  userData = JSON.parse(JSON.stringify(userData))
  for (let i in userData.info.show) {
    if (!userData.info.show[i] && userData.info[i]) delete userData.info[i]
  }
  delete userData.userClass
  return userData
}

function generateCode (userId, clientId) {
  return util.encrypt({
    t: (new Date()).getTime(),
    u: userId,
    c: clientId
  })
}

function readCode (code, time) {
  time = time || 1000 * 60 * 10
  let data = util.decrypt(code)
  assert(data, 'invalid_code') // 解密code
  data = JSON.parse(data)
  assert(data.t && data.c && data.u, 'invalid_code') // 检测code的完整性
  let validTime = new Date(data.t)
  assert(!Number.isNaN(validTime.getTime()), 'invalid_code') // 检测有效期的合法性
  assert((new Date().getTime()) - validTime < time, 'invalid_code') // 检测有效期
  return {
    userId: data.u,
    clientId: data.c
  }
}

function generateToken (userId, clientId) {
  const encrypted = util.encrypt({
    c: generateCode(userId, clientId),
    t: 'token'
  })
  const hash = util.hash(encrypted + 'token')
  return `${encrypted}&${hash}`
}

function readToken (token) {
  let data = token.splice('&')
  assert(data.length === 2, 'invalid_token') // 检测数据完整性
  assert(util.hash(data[0] + 'token') === data[1], 'invalid_token') // 检测签名有效性
  let decrypted = util.decrypt(data[0])
  assert(decrypted, 'invalid_token') // 检测解密状态
  decrypted = JSON.parse(decrypted)
  assert(decrypted.t && decrypted.c, 'invalid_token') // 检测token完整性
  assert(decrypted.t === 'token', 'invalid_token') // 检测token类型
  return readCode(decrypted.c, 1000 * 60 * 60 * 24 * 30) // 一个月的有效期
}

async function readSecret (clientSecret) {
  let data = clientSecret.splice('&')
  assert(data.length === 3, 'invalid_clientSecret') // 检测数据完整性
  let client = await clientModel.getById(data[0])
  assert(client, 'invalid_clientSecret') // 检测是否存在对应的ClientId
  assert(util.hash(data[1] + client.key) === data[2], 'invalid_clientSecret') // 检测数据合法性
  let validTime = util.decrypt(data[1], client.key) // 解密数据
  assert(validTime, 'invalid_clientSecret') // 检测解密状态
  validTime = new Date(validTime)
  assert(!Number.isNaN(validTime.getTime()), 'invalid_clientSecret') // 检测时间合法性
  assert((new Date().getTime()) - validTime < 1000 * 60, 'invalid_clientSecret') // 检测密钥有效期
  return client
}
