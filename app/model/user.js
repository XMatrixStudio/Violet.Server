const db = require('../../lib/mongo')
const userSchema = db.Schema({
  email: String,
  name: String,
  nikeName: String,
  password: String,
  salt: String,
  valid: Boolean,
  exp: Number,
  class: Number,
  detail: {
    web: String,
    phone: Number,
    info: String,
    sex: Number,
    birthDate: Date,
    location: String,
    avatar: String
  },
  emailCode: Number,
  emailTime: Date
}, { collection: 'users' })
const UserDB = db.model('users', userSchema)

exports.addUser = async(userEmail, userName, userPassword, userSalt) => {
  try {
    let user = new UserDB({
      email: userEmail,
      nikeName: userName,
      name: userName.toString().toLowerCase(),
      password: userPassword,
      salt: userSalt
    })
    let result = await user.save()
    return result._id
  } catch (error) {
    return false
  }
}

exports.getById = async userId => {
  try {
    let user = await UserDB.findById(userId)
    if (!user) throw new Error('null')
    return user
  } catch (error) {
    return false
  }
}

exports.getByName = async userName => {
  try {
    let user = await UserDB.findOne({ name: userName })
    if (!user) throw new Error('null')
    return user
  } catch (error) {
    return false
  }
}

exports.getByEmail = async userEmail => {
  try {
    let user = await UserDB.findOne({ email: userEmail })
    if (!user) throw new Error('null')
    return user
  } catch (error) {
    return false
  }
}

async function setById(userId, name, value) {
  let user = await exports.getById(userId)
  if (!user) return false
  user[name] = value
  await user.save()
  return true
}

exports.setExpById = async(userId, value) => {
  let result = await setById(userId, 'exp', value)
  return result
}

exports.setClassById = async(userId, value) => {
  let result = await setById(userId, 'class', value)
  return result
}

exports.setEmailCodeById = async(userId, value) => {
  let result = await setById(userId, 'emailCode', value)
  return result
}

exports.setEmailTimeById = async(userId, value) => {
  let result = await setById(userId, 'emailTime', value)
  return result
}

exports.validByEmail = async userEmail => {
  let user = await exports.getByEmail(userEmail)
  if (!user) return false
  user.valid = true
  await user.save()
  return true
}

exports.setPasswordByEmail = async(userEmail, password, userSalt) => {
  let user = await exports.getByEmail(userEmail)
  if (!user) return false
  user.password = password
  user.salt = userSalt
  await user.save()
  return true
}

exports.changeExpById = async(userId, value) => {
  let user = await exports.getById(userId)
  if (!user) return false
  user.exp += value
  await user.save()
  return true
}

exports.setDetailById = async(userId, data) => {
  let user = await exports.getById(userId)
  if (!user) return false
  if (data.web) user.detail.web = data.web
  if (data.phone) user.detail.phone = data.phone
  if (data.info) user.detail.info = data.info
  if (data.sex) user.detail.sex = data.sex
  if (data.birthDate) user.detail.birthDate = data.birthDate
  if (data.location) user.detail.location = data.location
  if (data.avatar) user.detail.avatar = data.avatar
  await user.save()
  return true
}
