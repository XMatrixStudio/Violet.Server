const db = require('../../lib/mongo')
let devSchema = db.Schema({
  name: String,
  userClient: [{
    name: String,
    icon: String,
    authCount: Number,
    key: String,
    url: String
  }]
}, { collection: 'devClients' })
let DevDB = db.model('devClients', devSchema)
