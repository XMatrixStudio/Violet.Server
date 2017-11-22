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
