import * as crypto from 'crypto'
import csprng = require('csprng')

/**
 * SHA512 hash
 *
 * @param {string} value 需要进行hash的字符串
 * @returns {string} SHA512hash后的字符串
 */
export function hash(value: string): string {
  const hash = crypto.createHash('sha512')
  hash.update(value)
  return hash.digest('hex')
}

/**
 * 密码hash
 *
 * @param {string} password 明文密码的SHA512散列值
 * @param {string} salt 盐，缺省值为随机生成的字符串
 */
export function hashPassword(password: string, salt: string = rand(260)): Record<'password' | 'salt', string> {
  const data: Record<'password' | 'salt', string> = { password: password, salt: salt }
  data.password = hash(hash(password).concat(data.salt))
  return data
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
