import * as Captchapng from 'captchapng2'
import * as fs from 'fs'
import { Context } from 'koa'
import * as moment from 'moment'
import * as mustache from 'mustache'
import * as Mailer from 'nodemailer'
import * as Sms from 'qcloudsms_js'

import * as config from './config'

/**
 * 生成验证码图片，并将验证码记录存储到Session中
 *
 * @param {Context} ctx - Koa上下文
 * @returns {string} 验证码图片的Base64字符串
 */
export function getCaptcha(ctx: Context): string {
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
export function checkCaptcha(ctx: Context, vcode: string): boolean {
  if (ctx.session!.verify.captcha === vcode) {
    ctx.session!.verify.captcha = undefined
    return true
  } else {
    ctx.session!.verify.captcha = undefined
    return false
  }
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

/**
 * 发送验证码邮件
 *
 * @param {Context} ctx Koa上下文
 * @param {string} email 邮箱地址
 * @param {string | undefined} name 名字
 * @returns {boolean} 是否发送成功
 */
export async function sendEmailCode(ctx: Context, type: string, email: string, name?: string): Promise<boolean> {
  const rand = Math.trunc(Math.random() * 900000 + 100000)
  ctx.session!.verify.email = email
  ctx.session!.verify.emailType = type
  ctx.session!.verify.emailCode = rand.toString()
  ctx.session!.verify.emailTime = Date.now()
  const contentOptions = {
    to: email,
    subject: '【Violet】邮箱验证码',
    html: mustache.render(fs.readFileSync('layout/email_verify.html', 'utf8'), {
      name: name,
      code: rand,
      time: moment().format('YYYY-MM-DD HH:mm:ss')
    })
  }
  try {
    const info = await mailer.sendMail(Object.assign({}, mailOptions, contentOptions))
    console.log(info)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

/**
 * 检查邮箱验证码，并且清除Session中的验证码记录
 * 该方法不检查超时
 *
 * @param {Context} ctx Koa上下文
 * @param {string} code 邮箱验证码
 */
export function checkEmailCode(ctx: Context, code: string): boolean {
  ctx.session!.verify.emailTime = undefined
  if (ctx.session!.verify.emailCode === code) {
    ctx.session!.verify.emailCode = undefined
    return true
  } else {
    ctx.session!.verify.emailCode = undefined
    return false
  }
}

const sender = Sms(config.sms.qcloud.appId, config.sms.qcloud.appKey).SmsSingleSender()

export async function sendPhoneCode(ctx: Context, type: string, phone: string, name?: string): Promise<boolean> {
  const rand = Math.trunc(Math.random() * 900000 + 100000)
  ctx.session!.verify.phone = phone
  ctx.session!.verify.phoneType = type
  ctx.session!.verify.phoneCode = rand.toString()
  ctx.session!.verify.phoneTime = Date.now()
  return new Promise((resolve, reject) => {
    sender.send(0, 86, phone, `【Violet】验证码:${rand}`, '', '', (err: Error, res: any, resData: any) => {
      console.log(resData)
      if (err) {
        reject(err)
      } else {
        resolve(resData)
      }
    })
  })
}

/**
 * 检查手机验证码，并且清除Session中的验证码记录
 * 该方法不检查超时
 *
 * @param {Context} ctx Koa上下文
 * @param {string} code 手机验证码
 */
export function checkPhoneCode(ctx: Context, code: string): boolean {
  ctx.session!.verify.phoneTime = undefined
  if (ctx.session!.verify.phoneCode === code) {
    ctx.session!.verify.phoneCode = undefined
    return true
  } else {
    ctx.session!.verify.phoneCode = undefined
    return false
  }
}
