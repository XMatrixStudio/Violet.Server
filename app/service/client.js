const ClientModel = require('../model/devClient')
const assert = require('../../lib/assert')
const util = require('../../lib/util')

exports.getList = async userId => {
  let clients = await ClientModel.getByOwner(userId)
  assert(clients, 'unknown_error_danger')
  let result = []
  for (let client of clients) {
    result.push({
      name: client.name,
      id: client._id,
      icon: client.icon
    })
  }
  return result
}

exports.add = async(userId, name, detail, url) => {
  let clientId = await ClientModel.add()
  let result = await ClientModel.setById(clientId, {
    name: name,
    ownerId: userId,
    detail: detail,
    url: url,
    key: util.rand(200),
    icon: '', // 默认头像
    data: {
      authCount: 0,
      loginCount: 0
    }
  })
  return result
}

exports.getInfo = async clientId => {
  let client = await ClientModel.getById(clientId)
  assert(client, 'invalid_clientId')
  return client
}

exports.setInfo = async(clientId, data) => {
  let result = await ClientModel.setById(clientId, data)
  assert(result, 'invalid_clientId')
}

exports.delete = async clientId => {
  let result = await ClientModel.deleteById(clientId)
  assert(result, 'invalid_clientId')
}

exports.changeKey = async clientId => {
  let newKey = util.rand(200)
  let result = await ClientModel.setById(clientId, {
    key: newKey
  })
  assert(result, 'invalid_clientId')
  return newKey
}
