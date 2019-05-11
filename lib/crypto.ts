import * as crypto from 'crypto'
import csprng = require('csprng')

import config from '../app/config/config'
import * as assert from './assert'

/**
 * 加密字符串
 * @param {string} str 需要加密的字符串
 * @param {string} key 密码
 * @return {string} 加密后的字符串
 */
export function encrypt(str: string, key: string): string {
  key = key || config!.auth.codeSecret
  const hash = crypto.createHash('sha256')
  hash.update(key)
  const keyBytes = hash.digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cfb', keyBytes, iv)
  const enc = [iv, cipher.update(str, 'utf8')]
  enc.push(cipher.final())
  return Buffer.concat(enc).toString('hex')
}

/**
 * 解密字符串
 * @param {string} str 需要解密的字符串
 * @param {string | undefined} key 密码
 * @return {string} 解密后的字符串
 */
export function decrypt(str: string, key: string): string {
  key = key || config!.auth.codeSecret
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

export function generateCode(userId: string, appId: string): string {
  return encrypt(JSON.stringify({ t: Date.now(), u: userId, a: appId }), config!.auth.codeSecret)
}

export function generateOpenId(userId: string, appId: string): string {
  return hash(userId + appId)
}

export function generateToken(userId: string, appId: string): string {
  const enc = encrypt(JSON.stringify({ c: generateCode(userId, appId), t: 'MAC-Token' }), config!.auth.tokenSecret)
  const hashData = hash(enc + config!.auth.tokenPadding)
  return `${enc}&${hashData}`
}

/**
 * SHA512 hash
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
 * @param {number} length 字符串的二进制长度
 * @returns {string} 指定长度的随机字符串[0-9a-z]
 */
export const rand = (length: number): string => {
  return csprng(length, 36)
}

export function readCode(code: string, time?: number): Record<'userId' | 'appId', string> {
  time = time || 1000 * 60
  const str = decrypt(code, config!.auth.codeSecret)
  assert(str, 'invalid_code') // 解密code
  const data: { t: number; u: string; a: string } = JSON.parse(str)
  assert(data.t && data.u && data.a, 'invalid_code') // 检测code的完整性
  const validTime = new Date(data.t)
  assert(!Number.isNaN(validTime.getTime()), 'invalid_code') // 检测有效期的合法性
  assert(Date.now() - validTime.getTime() < time, 'timeout_code') // 检测有效期
  return {
    userId: data.u,
    appId: data.a
  }
}

export function readToken(token: string, time?: number): Record<'userId' | 'appId', string> {
  time = time || 1000 * 60 * 60 * 24 * 15
  const arr = token.split('&')
  assert(arr.length === 2, 'invalid_token') // 检测数据完整性
  assert(hash(arr[0] + config!.auth.tokenPadding) === arr[1], 'invalid_token') // 检测签名有效性
  const str = decrypt(arr[0], config!.auth.tokenSecret)
  assert(str, 'invalid_token') // 检测解密状态
  const data: Record<'c' | 't', string> = JSON.parse(str)
  assert(data.t && data.c, 'invalid_token') // 检测token完整性
  assert(data.t === 'MAC-Token', 'invalid_token') // 检测token类型
  return readCode(data.c, time) // 一个月的有效期
}
