import { Context } from 'koa'

import * as util from '../../lib/util'

/**
 * 获取图形验证码
 *
 * @param {Context} ctx 上下文
 */
export const getVCode = async (ctx: Context) => {
  const rand = Math.trunc(Math.random() * 9000 + 1000)
  ctx.session!.vcode = rand
  ctx.body = await util.getVCode(rand)
  ctx.status = 200
}
