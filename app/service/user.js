const userModel = require('../model/user')
const assert = require('../../lib/assert')
const util = require('../../lib/util')

exports.login = async (userName, userPassword) => {
  let user
  if (userName.toString().indexOf('@') !== -1) {
    user = await userModel.getByEmail(userName)
  } else {
    user = await userModel.getByName(userName)
  }
  assert(user, 'error_pass') // 用户不存在
  let hashed = util.hashPassword(userPassword, user.salt)
  assert(hashed === user.password, 'error_pass') // 密码错误
  return {
    id: user._id,
    name: user.nikeName,
    email: user.email,
    avatar: user.avatar,
    valid: user.valid
  }
}

exports.register = async (userEmail, userName, userPassword) => {
  let user = await userModel.getByEmail(userEmail.toString().toLowerCase())
  assert(!user, 'exist_email') // 用户邮箱已存在
  user = await userModel.getByName(userName.toString().toLowerCase())
  assert(!user, 'exist_name') // 用户名已存在
  let data = util.hashPassword(userPassword)
  let userId = await userModel.add()
  await userModel.setById(userId, {
    email: userEmail,
    name: userName.toString().toLowerCase(),
    nikeName: userName,
    password: data.password,
    salt: data.salt
  })
}

exports.changePassword = async (userEmail, userPassword, vCode) => {
  await checkEmailCode(userEmail, vCode)
  let data = util.hashPassword(userPassword)
  await userModel.setPasswordByEmail(userEmail, data.password, data.salt)
}

exports.validEmail = async (userEmail, vCode) => {
  await checkEmailCode(userEmail, vCode)
  let result = await userModel.validByEmail(userEmail)
  assert(result, 'invalid_email') // 邮箱不存在
}

async function checkEmailCode (userEmail, vCode) {
  let user = await userModel.getByEmail(userEmail.toString().toLowerCase())
  assert(user, 'invalid_email') // 用户邮箱不存在
  assert(user.emailTime, 'timeout_vCode') // 还没有申请验证码
  let time = new Date(user.emailTime)
  assert(time.toString() !== 'Invalid Date', 'Invalid_Date_danger!') // 不应该发生的错误
  assert(new Date() - time < 1000 * 60 * 10, 'timeout_vCode') // 十分钟的有效期
  assert(user.emailCode === vCode, 'error_vCode') // 验证码错误
  await userModel.setById(user._id, {
    emailTime: new Date('2000-1-1')
  })
}

exports.getBaseInfo = async (userId) => {
  let user = await userModel.getById(userId)
  return {
    email: user.email,
    name: user.name,
    nikeName: user.nikeName,
    exp: user.exp,
    detail: user.detail
  }
}

exports.getEmailCode = async userEmail => {
  let user = userModel.getByEmail(userEmail)
  assert(user, 'invalid_email')
  if (user.emailTime) {
    let time = new Date(user.emailTime)
    assert(time.toString() !== 'Invalid Date', 'Invalid_Date_danger!') // 不应该发生的错误
    assert(new Date() - time < 1000 * 60, 'limit_time')
  }
  let code = parseInt(Math.random() * 900000 + 100000)
  // 发送验证邮件
  await userModel.setDataById(user._id, {
    emailCode: code,
    emailTime: new Date()
  })
}
