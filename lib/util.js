const crypto = require('crypto')
const rand = require('csprng')
const Captchapng = require('captchapng2')
const githubReservedUsernames = require('github-reserved-names')
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
exports.getVCode = value => {
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
exports.hashPassword = (password, salt) => {
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
exports.checkVCode = (ctx, vCode) => {
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
 * 解密字符串
 *
 * @param {string} str 需要解密的字符串
 * @param {string} key 密码
 * @return {string} 解密后的字符串
 */
exports.decrypt = (str, key) => {
  key = key || config.code.secret
  const hash = crypto.createHash('sha256')
  hash.update(key)
  const keyBytes = hash.digest()
  const contents = Buffer.from(str, 'hex')
  const iv = contents.slice(0, 16)
  const textBytes = contents.slice(16)
  const decipher = crypto.createDecipheriv('aes-256-cfb', keyBytes, iv)
  let res = decipher.update(textBytes, '', 'utf8')
  res += decipher.final('utf8')
  return res
}

/**
 * 加密字符串
 *
 * @param {string} str 需要加密的字符串
 * @param {string} key 密码
 * @return {string} 加密后的字符串
 */
exports.encrypt = (str, key) => {
  key = key || config.code.secret
  const hash = crypto.createHash('sha256')
  hash.update(key)
  const keyBytes = hash.digest()
  const contents = Buffer.from(str, 'hex')
  const iv = contents.slice(0, 16)
  const textBytes = contents.slice(16)
  const decipher = crypto.createDecipheriv('aes-256-cfb', keyBytes, iv)
  let res = decipher.update(textBytes, '', 'utf8')
  res += decipher.final('utf8')
  return res
}

/**
 * 判断用户名是否保留字
 *
 * @param {string} username 用户名
 * @return {Boolean} 是否为保留字
 */
exports.isReservedUsername = (username) => {
  if (!username) return true
  return githubReservedUsernames.check(username.toString())
}
