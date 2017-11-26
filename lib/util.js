const crypto = require('crypto')
const rand = require('csprng')
const Captchapng = require('captchapng2')
const config = require('../config')

exports.hash = value => {
  const hash = crypto.createHash('sha512')
  hash.update(value)
  return hash.digest('hex')
}

exports.rand = length => {
  return rand(length, 36)
}

exports.getVCode = async value => {
  let png = new Captchapng(80, 30, value)
  return 'data:image/png;base64,'.concat(png.getBase64())
}

exports.hashPassword = async(password, salt) => {
  let data = {}
  data.salt = (salt === undefined) ? exports.rand(260) : salt
  data.password = exports.hash(exports.hash(password).toString().concat(data.salt))
  return data
}

exports.checkVCode = async(ctx, vCode) => {
  if (ctx.session.vCode === 0) return false
  if (ctx.session.vCode === vCode) {
    ctx.session.vCode = 0
    return true
  }
}

exports.generateCode = async(userId, clientId) => {
  let codeData = {
    t: (new Date()).getTime(),
    u: userId,
    c: clientId
  }
  const cipher = crypto.createCipher('aes192', config.code.secret)
  let code = cipher.update(JSON.stringify(codeData), 'utf8', 'hex')
  code += cipher.final('hex')
  return code
}

exports.readCode = async code => {
  const decipher = crypto.createDecipher('aes192', config.code.secret)
  let decrypted = decipher.update(code, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
}
