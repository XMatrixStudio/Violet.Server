const authServer = require('../service/auth')
const verify = require('../../lib/verify')

exports.getList = async ctx => {
  ctx.body = await authServer.getList(await ctx.getUserId(ctx))
}

exports.get = async ctx => {
  let body = {
    clientId: ctx.params.id
  }
  verify({ data: body.clientId, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  let auth = await authServer.get(await ctx.getUserId(ctx), body.clientId)
  ctx.body = {
    auth: auth
  }
}

exports.auth = async ctx => {
  let body = {
    clientId: ctx.params.id
  }
  verify({ data: body.clientId, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  let result = await authServer.auth(await ctx.getUserId(ctx), body.clientId)
  ctx.body = {
    url: result.url,
    code: result.code
  }
}

exports.delete = async ctx => {
  let body = {
    clientId: ctx.params.id
  }
  verify({ data: body.clientId, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  await authServer.delete(await ctx.getUserId(ctx), body.clientId)
  ctx.status = 200
}
