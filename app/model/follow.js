const db = require('../../lib/mongo')
let followSchema = db.Schema({
  name: String,
  followers: [String],
  following: [String]
}, { collection: 'follow' })
let followDB = db.model('follow', followSchema)
