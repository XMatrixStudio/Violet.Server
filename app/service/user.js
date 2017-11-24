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

exports.changePassword = async(userEmail, userPassword, vCode) => {
  await checkEmailCode(userEmail, vCode)
  let data = util.hashPassword(userPassword)
  await userModel.setPasswordByEmail(userEmail, data.password, data.salt)
}

exports.validEmail = async(userEmail, vCode) => {
  await checkEmailCode(userEmail, vCode)
  let result = await userModel.validByEmail(userEmail)
  assert(result, 'invalid_email') // 邮箱不存在
}

async function checkEmailCode(userEmail, vCode) {
  let user = await userModel.getByEmail(userEmail.toString().toLowerCase())
  assert(user, 'invalid_email') // 用户邮箱不存在
  assert(user.emailTime, 'timeout_vCode') // 还没有申请验证码
  let time = new Date(user.emailTime)
  assert(time.toString() !== 'Invalid Date', 'Invalid_Date_danger!') // 不应该发生的错误
  assert(new Date() - time < 1000 * 60 * 10, 'timeout_vCode') // 十分钟的有效期
  assert(user.emailCode === vCode, 'error_vCode') // 验证码错误
  await userModel.setDataById(user._id, {
    emailTime: new Date('2000-1-1')
  })
}
