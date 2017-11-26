const userModel = require('../model/user')
const clientModel = require('../model/devClient')
const assert = require('../../lib/assert')

exports.getEmailCode = async userEmail => {
  let user = userModel.getByEmail(userEmail)
  assert(user, 'invalid_email')
  let time
  if (user.emailTime) {
    time = new Date(user.emailTime)
    assert(time.toString() !== 'Invalid Date', 'Invalid_Date_danger!') // 不应该发生的错误
    assert(new Date() - time < 1000 * 60, 'limit_time')
  }
  let code = parseInt(Math.random() * 900000 + 100000)
  await userModel.setDataById(user._id, {
    emailCode: code,
    emailTime: time
  })
}

exports.getClientInfo = async clientId => {
  let client = await clientModel.getClientById(clientId)
  assert(client, 'error_clientId')
  delete client.ownerId
  delete client.key
  delete client.data
  return client
}
