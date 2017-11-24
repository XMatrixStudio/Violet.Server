const Koa = require('koa')
const app = new Koa()
const config = require('./config')
const log = require('./lib/log')
const isDev = process.env.NODE_ENV !== 'production'
const userModel = require('./app/model/user')

// HTTP log
if (isDev) app.use(require('koa-morgan')('dev'))

// HTTPS 安全
app.use(require('koa-helmet')())
app.use(require('kcors')({
  credentials: true
}))

// session
app.keys = config.session.cookieKey
app.use(require('koa-session')(config.session, app))

// json and form to object
app.use(require('koa-bodyparser')())

// 获取用户信息
app.context.getUserData = async ctx => {
  if (!ctx.state.userData) {
    ctx.state.userData = await userModel.getById(ctx.session.userId)
  }
  return ctx.state.userData
}

// 路由
app.use(require('./app/router'))

// 异常处理
// 404和err.expose为true的错误不会捕捉
app.on('error', error => {
  if (!error.expose) {
    log.error(error.stack)
  }
})

app.listen(process.env.PORT || 30002)

console.log('Listen at port', 30002)
