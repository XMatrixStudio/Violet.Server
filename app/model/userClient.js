const db = require('../../lib/mongo')
let authSchema = db.Schema({
  name: String,
  authClient: [{
    name: String,
    id: String,
    icon: String,
    achievement: [String]
  }]
}, { collection: 'userClients' })
let AuthDB = db.model('userClients', authSchema)
