const userModel = require('../model/user')
const assert = require('../../lib/assert')
const util = require('../../lib/util')
const config = require('../../config')
const email = require('../../lib/email')
const cos = require('../../lib/cos')

exports.login = async (userName, userPassword) => {
  let user
  userName = userName.toString().toLowerCase()
  if (userName.indexOf('@') !== -1) {
    user = await userModel.getByEmail(userName)
  } else {
    user = await userModel.getByName(userName)
  }
  assert(user, 'error_pass') // 用户不存在
  let hashed = await util.hashPassword(userPassword, user.secure.salt)
  assert(hashed.password === user.secure.password, 'error_pass') // 密码错误
  return {
    id: user._id,
    name: user.nikeName,
    email: user.email,
    avatar: user.info.avatar || config.default.avatar,
    valid: user.secure.valid
  }
}

exports.register = async (userEmail, userName, userPassword) => {
  assert(!util.isReservedUsername(userName), 'reserved_name')
  let user = await userModel.getByEmail(userEmail)
  assert(!user, 'exist_email') // 用户邮箱已存在
  user = await userModel.getByName(userName)
  assert(!user, 'exist_name') // 用户名已存在
  let data = await util.hashPassword(userPassword)
  let userId = await userModel.add()
  await userModel.setById(userId, {
    email: userEmail,
    name: userName.toString().toLowerCase(),
    nikeName: userName,
    createTime: new Date(),
    secure: {
      password: data.password,
      salt: data.salt
    }
  })
  return userId
}

exports.changePassword = async (userEmail, userPassword, vCode) => {
  await checkEmailCode(userEmail, vCode)
  let data = await util.hashPassword(userPassword)
  await userModel.setPasswordByEmail(userEmail, data.password, data.salt)
}

exports.validEmail = async (userEmail, vCode) => {
  await checkEmailCode(userEmail, vCode)
  await userModel.validByEmail(userEmail)
}

async function checkEmailCode (userEmail, vCode) {
  let user = await userModel.getByEmail(userEmail.toString().toLowerCase())
  assert(user, 'invalid_email') // 用户邮箱不存在
  assert(user.secure.emailTime, 'timeout_emailCode') // 还没有申请验证码
  let time = new Date(user.secure.emailTime)
  assert(time.toString() !== 'Invalid Date', 'Invalid_Date_danger!') // 不应该发生的错误
  assert(new Date() - time < 1000 * 60 * 10, 'timeout_emailCode') // 十分钟的有效期
  assert(user.secure.emailCode.toString() === vCode, 'error_emailCode') // 验证码错误
  await userModel.setById(user.id, {
    secure: {
      emailTime: new Date('2000-1-1')
    }
  })
}

exports.getBaseInfo = async (userId) => {
  let user = await userModel.getById(userId)
  let info = user.info
  info.avatar = info.avatar || config.default.avatar
  return {
    email: user.email,
    name: user.nikeName,
    userClass: user.userClass,
    info: info
  }
}

exports.getEmailCode = async userEmail => {
  let user = await userModel.getByEmail(userEmail)
  assert(user, 'invalid_email')
  if (user.secure.emailTime) {
    let time = new Date(user.secure.emailTime)
    assert(time.toString() !== 'Invalid Date', 'Invalid_Date_danger!') // 不应该发生的错误
    assert(new Date() - time > 1000 * 60, 'limit_time')
  }
  let code = parseInt(Math.random() * 900000 + 100000)
  await email.sendEmailCode(userEmail, user.nikeName, code)
  await userModel.setById(user._id, {
    secure: {
      emailCode: code,
      emailTime: new Date()
    }
  })
}

exports.patchBaseInfo = async (userId, body) => {
  let res = await userModel.setInfoById(userId, body)
  assert(res, 'Invalid_data')
}

exports.avatar = async (userId, avatar) => {
  await cos.upload(userId + '.jpg', Buffer.from(avatar.replace('data:image/jpeg;base64,', ''), 'base64'))
  await userModel.setInfoById(userId, {
    avatar: config.cos.Url + userId + '.jpg'
  })
}
