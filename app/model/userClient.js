const db = require('../../lib/mongo')
let authSchema = db.Schema({
  name: String,
  authClient: [{
    id: String,
    achievement: [String]
  }]
}, { collection: 'userClients' })
let AuthDB = db.model('userClients', authSchema)
