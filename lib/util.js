const crypto = require('crypto')
const rand = require('csprng')
const Captchapng = require('captchapng2')
const config = require('../config')

/**
 * SHA512 hash
 *
 * @param {string} value 需要进行hash的字符串
 * @returns {string} SHA512hash后的字符串
 */
exports.hash = value => {
  const hash = crypto.createHash('sha512')
  hash.update(value)
  return hash.digest('hex')
}

/**
 * 生成随机字符串
 *
 * @param {number} length 字符串的二进制长度
 * @returns {string} 指定长度的随机字符串[0-9a-z]
 */
exports.rand = length => {
  return rand(length, 36)
}

/**
 * 生成验证码图片
 *
 * @param {number} value 四位验证码
 * @returns {string} PNG 图片验证码的Base64
 */
exports.getVCode = async value => {
  let png = new Captchapng(80, 30, value)
  return 'data:image/png;base64,'.concat(png.getBase64())
}

/**
 * 对密码进行加盐hash
 *
 * @param {string} password 密码
 * @param {string} salt 盐值
 * @returns {string} 加盐hash后的密码
 */
exports.hashPassword = async (password, salt) => {
  let data = {}
  data.salt = (salt === undefined) ? exports.rand(260) : salt
  data.password = exports.hash(exports.hash(password).toString().concat(data.salt))
  return data
}

/**
 * 检查验证码
 *
 * @param {object} ctx koa对象
 * @param {string} vCode 验证码
 * @returns {boolean} 验证码是否正确
 */
exports.checkVCode = async (ctx, vCode) => {
  if (ctx.session.vCode === 0) return false
  if (ctx.session.vCode.toString() === vCode) {
    ctx.session.vCode = 0
    return true
  } else {
    ctx.session.vCode = 0
    return false
  }
}

/**
 * 生成code，用于客户端授权
 *
 * @param {string} userId
 * @param {string} clientId
 * @returns {string} 开发者访问凭据code
 */
exports.generateCode = async (userId, clientId) => {
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

/**
 * 解析code
 *
 * @param {string} code 加密的code
 * @returns {object} 解密后的code
 */
exports.readCode = async code => {
  const decipher = crypto.createDecipher('aes192', config.code.secret)
  let decrypted = decipher.update(code, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
}
