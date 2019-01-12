import { Context } from 'koa'
import * as _ from 'lodash'

import { default as verify } from '../../lib/verify'
import * as userService from '../service/user'

const emailExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
const nameExp = /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/

export const getUser = async (ctx: Context) => {
  ctx.status = 200
}

export const postUser = async (ctx: Context) => {
  const body = _.pick(ctx.request.body, ['name', 'email', 'password', 'vcode'])
  verify({ data: body.name, require: true, type: 'string', regExp: nameExp, message: 'invalid_name' })
  verify({ data: body.email, require: true, type: 'string', regExp: emailExp, maxLength: 64, message: 'invalid_email' })
  verify({ data: body.password, require: true, type: 'string', maxLength: 128, minLength: 128, message: 'invalid_password' })
  verify({ data: body.vcode, require: true, type: 'string', maxLength: 4, minLength: 4, message: 'invalid_code' })

  // TODO
  await userService.register()

  // 注册成功
  ctx.status = 200
}
