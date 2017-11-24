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

exports.setDataById = async(userId, data) => {
  try {
    let user = await UserDB.findById(userId)
    if (!user) throw new Error('null')
    let names = ['name', 'nikeName', 'password', 'salt', 'valid', 'exp', 'class', 'emailCode', 'emailTime']
    for (let name of names) {
      if (data[name]) user[name] = data[name]
    }
    if (data.detail) {
      let names = ['web', 'phone', 'info', 'sex', 'birthDate', 'location', 'avatar']
      for (let name of names) {
        if (data.detail[name]) user.detail[name] = data.detail[name]
      }
    }
    await user.save()
    return true
  } catch (error) {
    return false
  }
}

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

/*
async function test() {
  let user = await exports.getByEmail('zhenly@qq.com')
  console.log(user)
  await exports.setDataById(user._id, {
    nikeName: 'ZhenlyChenChen'
  })
  user = await exports.getByEmail('zhenly@qq.com')
  console.log(user)
}
test()
 */
