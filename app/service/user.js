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
  userPassword = util.hash(userPassword)
  userPassword = userPassword.toString().concat(user.salt)
  userPassword = util.hash(userPassword)
  assert(userPassword === user.password, 'error') // 密码错误
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
  assert(user === false, 'exist_email') // 用户邮箱已存在
  user = await userModel.getByName(userName.toString().toLowerCase())
  assert(user === false, 'exist_name') // 用户名已存在
  let userSalt = util.rand()
  userPassword = util.hash(userPassword)
  userPassword = userPassword.toString().concat(userSalt)
  userPassword = util.hash(userPassword)
  await userModel.add(userEmail, userName, userPassword, userSalt)
  return true
}
