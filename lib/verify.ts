import * as Captchapng from 'captchapng2'
import * as fs from 'fs'
import { Context } from 'koa'
import * as moment from 'moment'
import * as mustache from 'mustache'
import * as Mailer from 'nodemailer'

import * as config from './config'

/**
 * 生成验证码图片，并将验证码记录存储到Session中
 *
 * @param {Context} ctx - Koa上下文
 * @returns {string} 验证码图片的Base64字符串
 */
export const getCaptcha = (ctx: Context): string => {
  const rand = Math.trunc(Math.random() * 9000 + 1000)
  const png = new Captchapng(80, 30, rand)
  ctx.session!.verify.captcha = rand.toString()
  return 'data:image/png;base64,'.concat(png.getBase64())
}

/**
 * 检查图形验证码，并且清除Session中的验证码记录
 *
 * @param {Context} ctx Koa上下文
 * @param {string} vcode 图形验证码
 * @returns {boolean} 验证码是否正确
 */
export const checkCaptcha = (ctx: Context, vcode: string): boolean => {
  if (ctx.session!.verify.captcha === undefined) return false
  ctx.session!.verify.captcha = undefined
  return ctx.session!.verify.captcha === vcode
}

const mailer = Mailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password
  },
  tls: {
    ciphers: 'SSLv3'
  }
})

const mailOptions: Mailer.SendMailOptions = {
  from: config.email.from
}

export const sendEmailCode = (ctx: Context, email: string, name?: string): void => {
  const rand = Math.trunc(Math.random() * 9000 + 1000)
  // ctx.session!.verify.emailCode = rand.toString()
  // ctx.session!.verify.emailTime = new Date()
  const contentOptions = {
    to: email,
    subject: '【Violet】邮箱验证码',
    html: mustache.render(fs.readFileSync('layout/email_verify.html', 'utf8'), {
      name: name,
      code: rand,
      time: moment().format('YYYY-MM-DD HH:mm:ss')
    })
  }
  mailer.sendMail(Object.assign({}, mailOptions, contentOptions), (error: Error | null, info: any) => {
    if (error) {
      console.log(error)
    } else {
      console.log(info)
    }
  })
}
