import * as crypto from 'crypto'
import csprng = require('csprng')
import * as reservedUsernames from 'github-reserved-names'

/**
 * SHA512 hash
 *
 * @param {string} value 需要进行hash的字符串
 * @returns {string} SHA512hash后的字符串
 */
export const hash = (value: string) => {
  const hash = crypto.createHash('sha512')
  hash.update(value)
  return hash.digest('hex')
}

/**
 * 判断用户名是否保留字
 *
 * @param {string} username 用户名
 * @return {Boolean} 是否为保留字
 */
export const isReservedUsername = (username: string): boolean => {
  if (!username) return true
  return reservedUsernames.check(username.toString())
}

/**
 * 生成随机字符串
 *
 * @param {number} length 字符串的二进制长度
 * @returns {string} 指定长度的随机字符串[0-9a-z]
 */
export const rand = (length: number): string => {
  return csprng(length, 36)
}
