import { Context } from 'koa'

import * as verify from '../../lib/verify'

/**
 * 获取图形验证码，验证码存储在`ctx.session!.vcode`中
 */
export async function getCaptcha(ctx: Context) {
  ctx.body = await verify.getCaptcha(ctx)
  ctx.status = 200
}
