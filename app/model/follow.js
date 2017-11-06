const db = require('../../lib/mongo')
let followSchema = db.Schema({
  name: String,
  followers: [String],
  following: [String]
}, { collection: 'follow' })
let FollowDB = db.model('follow', followSchema)
