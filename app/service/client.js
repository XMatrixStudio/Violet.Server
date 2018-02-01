const ClientModel = require('../model/client')
const assert = require('../../lib/assert')
const util = require('../../lib/util')
const config = require('../../config')
const cos = require('../../lib/cos')

exports.getList = async userId => {
  let clients = await ClientModel.getByOwner(userId)
  assert(clients, 'unknown_error_danger')
  let result = []
  for (let client of clients) {
    result.push({
      name: client.name,
      id: client._id,
      icon: client.icon || config.default.avatar,
      detail: client.detail
    })
  }
  return result
}

exports.add = async (userId) => {
  let clientId = await ClientModel.add()
  let result = await ClientModel.setById(clientId, {
    name: '新建应用',
    ownerId: userId,
    detail: '应用简介',
    url: 'https://oatuh.xmatrix.studio',
    callBack: 'https://oatuh.xmatrix.studio',
    key: util.rand(200),
    icon: config.default.avatar,
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

exports.setInfo = async (clientId, data) => {
  for (let name in data) {
    if (data[name] === undefined) delete data[name]
  }
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

exports.getClientInfo = async clientId => {
  let client = await ClientModel.getById(clientId)
  assert(client, 'error_clientId')
  let data = {
    name: client.name,
    detail: client.detail,
    url: client.url,
    icon: client.icon
  }
  return data
}

exports.changeIcon = async (userId, clientId, icon) => {
  assert((await exports.getInfo(clientId)).ownerId === userId, 'error_token')
  await cos.upload(clientId + '.jpg', Buffer.from(icon.replace('data:image/jpeg;base64,', ''), 'base64'))
  await ClientModel.setById(clientId, {
    icon: config.cos.Url + clientId + '.jpg'
  })
}
