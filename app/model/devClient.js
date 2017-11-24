const db = require('../../lib/mongo')
let devSchema = db.Schema({
  name: String,
  ownerId: String,
  icon: String,
  key: String,
  url: String,
  detail: String,
  data: {
    authCount: Number,
    LoginCount: Number
  }
}, { collection: 'devClients' })
let DevDB = db.model('devClients', devSchema)

exports.getClientById = async clientId => {
  try {
    let client = await DevDB.findById(clientId)
    if (!client) throw new Error('null')
    return client
  } catch (error) {
    return false
  }
}

exports.gitClientByOwner = async ownerId => {

}

exports.setDataById = async(clientId, data) => {
  try {
    let client = await DevDB.findById(clientId)
    if (!client) throw new Error('null')
    if (data.name) client.name = data.name
    if (data.ownerId) client.ownerId = data.ownerId
    if (data.icon) client.icon = data.icon
    if (data.key) client.key = data.key
    if (data.url) client.url = data.url
    if (data.detail) client.detail = data.detail
    if (data.authCount) client.data.authCount = data.authCount
    if (data.LoginCount) client.data.LoginCount = data.LoginCount
    await client.save()
    return true
  } catch (error) {
    return false
  }
}
