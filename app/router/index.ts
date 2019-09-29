import { HttpError } from 'http-errors'
import * as Router from 'koa-router'

import * as verify from '../../lib/verify'
import { IState, ICustom, Context } from '../../types/context'
import * as admin from './admin'
import * as api from './api'
import * as app from './app'
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
    urls: ['/i/apps/:nameOrId', '/i/orgs/:name/apps', '/i/users/:name', '/i/users/:name/apps', '/i/users/:name/orgs', '/i/util/captcha']
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

// 检查是否登录
const withoutLogin = (ctx: Context, next: () => Promise<any>) => {
  ctx.state.passLoginStatusCheck = true
  return next()
}

// 对白名单里面的每个规则创建一个路由
// 按需求检查登录状态
for (const rule of whiteLoginList) {
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
  if (!ctx.session!.verify) ctx.session!.verify = {}
  if (!ctx.session!.user) ctx.session!.user = {}
  if (!ctx.state.passLoginStatusCheck) await verify.requireLogin(ctx)
  return next()
})

router.use('', api.routes())

router.use('/i/admin', admin.routes())
router.use('/i/apps', app.routes())
router.use('/i/orgs', org.routes())
router.use('/i/users', user.routes())
router.use('/i/util', util.routes())

export = router
