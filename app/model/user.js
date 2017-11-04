const db = require('../../lib/mongo')
const verify = require('../../lib/verify')
const userSchema = db.Schema({
  email: String,
  name: String,
  nikeName: String,
  password: String,
  valid: Boolean,
  exp: Number,
  detail: {
    web: String,
    phone: Number,
    info: String,
    sex: Number,
    birthDate: Date,
    location: String,
    avatar: String,
    class: Number
  }
}, { collection: 'users' })
const userDB = db.model('users', userSchema)

exports.getById = async userId => {
  let user = await userDB.findById(userId)
  return user
}

exports.getByName = async(userName) => {
  let user = await userDB.findOne({ name: userName })
  return user
}

exports.getByEmail = async(userEmail) => {
  let user = await userDB.findOne({ email: userEmail })
  return user
}

/*
async function test(params) {
  let user = await exports.getByName('ZhenlyChen')
  console.log(user)
}

test(); */
