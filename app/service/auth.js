const clientModel = require('../model/client')
const userModel = require('../model/user')
const assert = require('../../lib/assert')
const util = require('../../lib/util')

/**
 * 获取授权列表
 *
 * @param {string} userId
 * @returns {array}
 */
exports.getList = async userId => {
  let authList = await userModel.getAuthList(userId)
  let list = []
  for (let auth of authList) {
    let client = await clientModel.getById(auth)
    list.push({
      name: client.name,
      id: client.id,
      icon: client.icon,
      detail: client.detail
    })
  }
  return list
}

/**
 * 用户是否授权某站点
 *
 * @param {string} userId
 * @param {string} clientId
 * @returns {boolean}
 */
exports.get = async (userId, clientId) => {
  let authList = await userModel.getAuthList(userId)
  let isAuth = false
  for (let auth of authList) {
    if (auth.clientId === clientId) {
      isAuth = true
    }
  }
  return isAuth
}

/**
 * 用户授权站点
 *
 * @param {string} userId
 * @param {string} clientId
 * @returns {object}
 *          code 授权码
 *          url  跳转的网站
 */
exports.auth = async (userId, clientId) => {
  let result = await userModel.addAuth(userId, clientId)
  assert(result, 'invalid_clientId')
  if (result.isNew) await clientModel.addAuthById(clientId, 1)
  await clientModel.addLoginById(clientId, 1)
  let code = await util.generateCode(userId, clientId)
  let client = await clientModel.getById(clientId)
  return {
    code: code,
    url: client.url
  }
}

/**
 * 取消对某个网站的授权
 *
 * @param {string} userId
 * @param {string} clientId
 * @returns {void}
 */
exports.delete = async (userId, clientId) => {
  let result = await userModel.deleteAuth(userId, clientId)
  assert(result, 'invalid_clientId')
}
