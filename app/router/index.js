const Router = require('koa-router')

let router = new Router()

router.get('/api', (ctx) => {
  console.log('hello', ctx.user(ctx))
  ctx.session.userId = 1234
  ctx.body = ctx.session.userId
  ctx.state = 200
})

module.exports = router.routes()
