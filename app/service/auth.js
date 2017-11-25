const clientModel = require('../model/client')
const userModel = require('../model/user')
const assert = require('../../lib/assert')

exports.getList = async userId => {
  let authList = await userModel.getAuthList(userId)
  let list = []
  for (let auth of authList) {
    list.push(auth.clientId)
  }
  return list
}

exports.get = async(userId, clientId) => {
  let authList = await userModel.getAuthList(userId)
  let isAuth = false
  for (let auth of authList) {
    if (auth.clientId === clientId) {
      isAuth = true
    }
  }
  return isAuth
}

exports.auth = async(userId, clientId) => {
  let result = await userModel.addAuth(userId, clientId)
  assert(result, 'invalid_clientId')
  if (result.isNew) await clientModel.addAuthById(clientId, 1)
  await clientModel.addLoginById(clientId, 1)

  // return code
}

exports.delete = async(userId, clientId) => {
  let result = await userModel.deleteAuth(userId, clientId)
  assert(result, 'invalid_clientId')
}
