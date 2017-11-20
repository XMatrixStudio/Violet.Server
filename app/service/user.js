const userModel = require('../model/user')
const assert = require('../../lib/assert')
const util = require('../../lib/util')

exports.login = async(userName, userPassword) => {
  let user
  if (userName.toString().indexOf('@') !== -1) {
    user = await userModel.getByEmail(userName)
  } else {
    user = await userModel.getByName(userName)
  }
  assert(user, 'error') // 用户不存在
  let hashed = util.hashPassword(userPassword, user.salt)
  assert(hashed === user.password, 'error') // 密码错误
  return {
    id: user._id,
    name: user.nikeName,
    email: user.email,
    avatar: user.avatar,
    valid: user.valid
  }
}

exports.register = async(userEmail, userName, userPassword) => {
  let user = await userModel.getByEmail(userEmail.toString().toLowerCase())
  assert(!user, 'exist_email') // 用户邮箱已存在
  user = await userModel.getByName(userName.toString().toLowerCase())
  assert(!user, 'exist_name') // 用户名已存在
  let data = util.hashPassword(userPassword)
  await userModel.add(userEmail, userName, data.password, data.salt)
}

exports.changePassword = async(userEmail, userPassword) => {
  let user = await userModel.getByEmail(userEmail.toString().toLowerCase())
  assert(user, 'invalid_email') // 邮箱不存在
  let data = util.hashPassword(userPassword)
  await userModel.setPasswordByEmail(userEmail, data.password, data.salt)
}

exports.validEmail = async userId => {
  let result = await userModel.validByEmail(userId)
  assert(result, 'invalid_email') // 邮箱不存在
}
