import * as fs from 'fs'
import * as moment from 'moment'
import * as mustache from 'mustache'
import * as Mailer from 'nodemailer'

import config from '../app/config/config'

const mailer = Mailer.createTransport({
  host: config!.email.host,
  port: config!.email.port,
  secure: false,
  auth: {
    user: config!.email.user,
    pass: config!.email.password
  },
  tls: {
    ciphers: 'SSLv3'
  }
})

const layout = fs.readFileSync('layout/email.html', 'utf8')
const registerLayout = fs.readFileSync('layout/register.html', 'utf8')
const resetLayout = fs.readFileSync('layout/reset.html', 'utf8')
const updateLayout = fs.readFileSync('layout/reset.html', 'utf8')

/**
 * 发送邮件
 * @param {string} from 发送邮件的邮箱
 * @param {string} to 接收邮件的邮箱
 * @param {string} subject 标题
 * @param {string} template 邮件模板
 * @param {object} args 邮件模板参数
 * @returns {boolean} 是否发送成功
 */
export async function sendEmail(from: string, to: string, subject: string, template: string, args: object): Promise<boolean> {
  const mailOptions: Mailer.SendMailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: mustache.render(layout, {
      template: mustache.render(template, args)
    })
  }
  try {
    const info = await mailer.sendMail(mailOptions)
    console.log(info)
    return true
  } catch (err) {
    console.log(err)
  }
  return false
}

/**
 * 发送注册验证码邮件
 * @param {string} email 邮箱地址
 * @param {string} code 验证码
 */
export async function sendRegisterEmailCode(email: string, code: string): Promise<boolean> {
  return await sendEmail(config!.email.from.code, email, 'Violet注册邮箱验证码', registerLayout, {
    code: code,
    time: moment().format('YYYY/M/DD HH:mm:ss')
  })
}

export async function sendResetEmailCode(email: string, code: string, name: string): Promise<boolean> {
  return await sendEmail(config!.email.from.code, email, 'Violet重置密码验证码', resetLayout, {
    name: name,
    code: code,
    time: moment().format('YYYY/M/DD HH:mm:ss')
  })
}

export async function sendUpdateEmailCode(email: string, code: string, name: string): Promise<boolean> {
  return await sendEmail(config!.email.from.code, email, 'Violet重置邮箱验证码', updateLayout, {
    name: name,
    code: code,
    time: moment().format('YYYY/M/DD HH:mm:ss')
  })
}
