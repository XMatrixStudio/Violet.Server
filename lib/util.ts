import * as Captchapng from 'captchapng2'
import * as crypto from 'crypto'
import csprng = require('csprng')
import * as reservedUsernames from 'github-reserved-names'
import { Context } from 'koa'

/**
 * 生成验证码图片
 *
 * @param {number} value 四位验证码
 * @returns {string} PNG 图片验证码的Base64
 */
export const getVCode = (value: number): string => {
  const png = new Captchapng(80, 30, value)
  return 'data:image/png;base64,'.concat(png.getBase64())
}

/**
 * 检查图形验证码
 *
 * @param {Context} ctx Koa上下文
 * @param {string | number} vcode 图形验证码
 * @returns {boolean} 验证码是否正确
 */
export const checkVCode = (ctx: Context, vcode: string | number): boolean => {
  if (ctx.session!.vcode === 0) return false
  if (ctx.session!.vcode.toString() === vcode) {
    ctx.session!.vcode = 0
    return true
  } else {
    ctx.session!.vcode = 0
    return false
  }
}

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
