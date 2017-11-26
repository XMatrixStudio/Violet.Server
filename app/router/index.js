const Router = require('koa-router')
const user = require('./user')
const client = require('./client')
const auth = require('./auth')
const util = require('./util')
const assert = require('../../lib/assert')

// 白名单列表
// 凡是在此白名单 均不检查是否登陆
const whiteList = {
  get: {
    '/v2/self/util/vCode': true,
    '/v2/self/util/EmailCode': true,
    '/v2/self/util/ClientInfo/:clientId': true
  },
  post: {
    '/v2/self/user/login': true,
    '/v2/self/user/register': true
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
router.use('/v2/self/', async(ctx, next) => {
  if (!ctx.state.passStatusCheck) {
    assert(ctx.session.userId, 'invalid_token')
    assert(ctx.session.remember || (new Date(ctx.session.time) - new Date()) >= 86400000, 'timeout_token')
    if (!ctx.session.remember) ctx.session.time = new Date()
    let user = await ctx.getUserData()
    assert(user, 'invalid_token')
  }
  return next()
})

router.use('/v2/self/users', user.routes())
router.use('/v2/self/util', util.routes())
router.use('/v2/self/auth', auth.routes())
router.use('/v2/self/client', client.routes())
module.exports = router.routes()
