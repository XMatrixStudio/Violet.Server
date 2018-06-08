const Router = require('koa-router')
const user = require('./user')
const client = require('./client')
const auth = require('./auth')
const util = require('./util')
const api = require('./api')
const assert = require('../../lib/assert')

// 白名单列表
// 凡是在此白名单 均不检查是否登陆
const whiteList = {
  get: {
    '/v2/self/util/vCode': true,
    '/v2/self/util/ClientInfo/:clientId': true,
    '/v2/verify/Token': true,
    '/v2/users/BaseData': true
  },
  post: {
    '/v2/self/users/login': true,
    '/v2/self/util/EmailCode': true,
    '/v2/self/users/register': true,
    '/v2/self/users/password': true,
    '/v2/api/Login': true,
    '/v2/api/Register': true,
    '/v2/api/ChangePassword': true,
    '/v2/api/GetEmailCode': true
  },
  delete: {
    '/v2/self/users/login': true
  }
}

// 处理函数
const withoutLogin = (ctx, next) => {
  ctx.state.passStatusCheck = true
  return next()
}

let router = new Router()

// 对白名单里面的每个规则创建一个路由
// 按需求检查登录状态
for (const method in whiteList) {
  for (const path in whiteList[method]) {
    router[method](path, withoutLogin)
  }
}

// 兜底判断，如果没有被白名单检查，则必须登录
router.use('/v2/self/', async (ctx, next) => {
  if (!ctx.state.passStatusCheck) {
    assert(ctx.session.userId, 'invalid_token')
    assert(ctx.session.remember || ((new Date() - new Date(ctx.session.time)) <= (86400 * 1000)), 'timeout_token')
    if (!ctx.session.remember) ctx.session.time = new Date()
    let user = await ctx.getUserData(ctx)
    assert(user, 'invalid_token')
  }
  return next()
})

router.use('/v2', api.routes())
router.use('/v2/self/users', user.routes())
router.use('/v2/self/util', util.routes())
router.use('/v2/self/auth', auth.routes())
router.use('/v2/self/client', client.routes())
module.exports = router.routes()
