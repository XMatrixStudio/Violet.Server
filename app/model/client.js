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
}, { collection: 'client' })
let DevDB = db.model('client', devSchema)

exports.addAuthById = async (clientId, value) => {
  try {
    let client = await DevDB.findById(clientId)
    if (!client) throw new Error('null')
    if (!client.data.authCount) client.data.authCount = 0
    client.data.authCount += value
    await client.save()
  } catch (error) {
    return false
  }
}

exports.addLoginById = async (clientId, value) => {
  try {
    let client = await DevDB.findById(clientId)
    if (!client) throw new Error('null')
    if (!client.data.LoginCount) client.data.LoginCount = 0
    client.data.LoginCount += value
    await client.save()
  } catch (error) {
    return false
  }
}

exports.add = async () => {
  try {
    let client = new DevDB()
    let result = await client.save()
    return result._id
  } catch (error) {
    return false
  }
}

exports.getById = async clientId => {
  try {
    let client = await DevDB.findById(clientId)
    if (!client) throw new Error('null')
    return client
  } catch (error) {
    return false
  }
}

exports.getByOwner = async ownerId => {
  try {
    let clients = await DevDB.find({ ownerId: ownerId })
    return clients
  } catch (error) {
    return false
  }
}

exports.setById = async (clientId, data) => {
  try {
    let client = await DevDB.findById(clientId)
    if (!client) throw new Error('null')
    let names = ['name', 'ownerId', 'icon', 'key', 'url', 'detail']
    for (let name of names) {
      if (data[name]) client[name] = data[name]
    }
    if (data.data) {
      let names = ['authCount', 'LoginCount']
      for (let name of names) {
        if (data[name]) client.data[name] = data.data[name]
      }
    }
    await client.save()
    return true
  } catch (error) {
    return false
  }
}

exports.deleteById = async clientId => {
  try {
    let result = await DevDB.findByIdAndRemove(clientId)
    return result
  } catch (error) {
    return false
  }
}
