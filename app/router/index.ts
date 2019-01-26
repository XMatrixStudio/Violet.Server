import { HttpError } from 'http-errors'
import { Context } from 'koa'
import * as Router from 'koa-router'

import * as assert from '../../lib/assert'
import * as user from './user'
import * as util from './util'

const router = new Router()

type HttpHandler = (path: string | RegExp | (string | RegExp)[], ...middleware: Array<Router.IMiddleware>) => Router

// 白名单列表
// 凡是在此白名单，均不检查是否登陆
const whiteList: { method: HttpHandler; urls: string[] }[] = [
  {
    method: router.get,
    urls: ['/i/util/vcode']
  },
  {
    method: router.post,
    urls: ['/i/user', '/i/user/email']
  }
]

// 检查是否登录
const withoutLogin = (ctx: Context, next: () => Promise<any>) => {
  ctx.state.passStatusCheck = true
  return next()
}

// 对白名单里面的每个规则创建一个路由
// 按需求检查登录状态
for (const rule of whiteList) {
  for (const url of rule.urls) {
    rule.method.call(router, url, withoutLogin)
  }
}

// 错误处理
router.use('/', async (ctx: Context, next: () => Promise<any>) => {
  return next().catch((err: HttpError) => {
    if (err.expose) {
      ctx.status = err.status || 500
      ctx.type = 'application/json'
      ctx.body = { error: err.message }
    } else {
      throw err
    }
  })
})

// 兜底判断，如果没有被白名单检查，则必须登录
router.use('/i/', async (ctx: Context, next: () => Promise<any>) => {
  if (!ctx.state.passStatusCheck) {
    assert(ctx.session, 'invalid_token')
    assert(ctx.session!.userId, 'invalid_token')
    assert(ctx.session!.remember || +new Date() - +new Date(ctx.session!.time) <= 86400 * 1000, 'timeout_token')
    if (!ctx.session!.remember) ctx.session!.time = new Date()
  }
  return next()
})

router.use('/i/user', user.routes())
router.use('/i/util', util.routes())

export = router
