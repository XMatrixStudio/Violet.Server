const userModel = require('../model/user')
const assert = require('../../lib/assert')

exports.getEmailCode = async userEmail => {
  let user = userModel.getByEmail(userEmail)
  assert(user, 'invalid_email')
  let time
  if (user.emailTime) {
    time = new Date(user.emailTime)
    assert(time.toString() !== 'Invalid Date', 'Invalid_Date_danger!') // 不应该发生的错误
    assert(new Date() - time < 1000 * 60, 'limit_time')
  }
  let code = parseInt(Math.random() * 900000 + 100000)
  await userModel.setEmailCodeById(user._id, code)
  await userModel.setEmailTimeById(user._id, time)
}
