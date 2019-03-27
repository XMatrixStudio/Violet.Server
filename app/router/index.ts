import { HttpError } from 'http-errors'
import * as Router from 'koa-router'

import * as verify from '../../lib/verify'
import { IState, ICustom, Context } from '../../types/context'
import * as level from './level'
import * as org from './org'
import * as user from './user'
import * as util from './util'

const router = new Router<IState, ICustom>()

type HttpHandler = (path: string | RegExp | (string | RegExp)[], ...middleware: Array<Router.IMiddleware<IState, ICustom>>) => Router

// 白名单列表
// 凡是在此白名单, 均不检查是否登陆
const whiteLoginList: { method: HttpHandler; urls: string[] }[] = [
  {
    method: router.get,
    urls: ['/i/users/:name', '/i/util/captcha']
  },
  {
    method: router.post,
    urls: ['/i/users', '/i/users/email', '/i/users/phone', '/i/users/session']
  },
  {
    method: router.put,
    urls: ['/i/users/email', '/i/users/phone']
  },
  {
    method: router.delete,
    urls: ['/i/users/session']
  }
]

// 白名单列表
// 凡是在此白名单, 均不检查是否封禁, 前提已登陆
const whiteBannedList: { method: HttpHandler; urls: string[] }[] = [
  { method: router.get, urls: ['/i/levels', '/i/levels/users'] },
  { method: router.post, urls: ['/i/levels/users'] }
]

// 检查是否登录
const withoutLogin = (ctx: Context, next: () => Promise<any>) => {
  ctx.state.passLoginStatusCheck = true
  return next()
}

// 检查是否被封禁
const withoutBanned = (ctx: Context, next: () => Promise<any>) => {
  ctx.state.passBannedStatusCheck = true
  return next()
}

// 对白名单里面的每个规则创建一个路由
// 按需求检查登录状态
for (const rule of whiteLoginList) {
  for (const url of rule.urls) {
    rule.method.call(router, url, withoutLogin)
  }
}
for (const rule of whiteBannedList) {
  for (const url of rule.urls) {
    rule.method.call(router, url, withoutBanned)
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
  if (!ctx.session!.verify) ctx.session!.verify = {}
  if (!ctx.session!.user) ctx.session!.user = {}
  if (!ctx.state.passLoginStatusCheck) {
    verify.checkLoginState(ctx)
    if (!ctx.state.passBannedStatusCheck) await verify.checkBannedState(ctx)
  }
  return next()
})

router.use('/i/levels', level.routes())
router.use('/i/orgs', org.routes())
router.use('/i/users', user.routes())
router.use('/i/util', util.routes())

export = router
