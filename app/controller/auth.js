const authServer = require('../service/auth')
const verify = require('../../lib/verify')
const assert = require('../../lib/assert')
const _ = require('lodash')

exports.getList = async ctx => {
  let list = await authServer.getList(ctx.getUserId())
  return list
}

exports.get = async ctx => {
  let body = {
    clientId: ctx.params.id
  }
  verify({ data: body.clientId, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  let auth = await authServer.get(ctx.getUserId(), body.clientId)
  ctx.body = {
    auth: auth
  }
}

exports.auth = async ctx => {
  let body = {
    clientId: ctx.params.id
  }
  verify({ data: body.clientId, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  let result = await authServer.auth(ctx.getUserId(), body.clientId)
  ctx.redirect(`${result.url}?code=${result.code}&state=${ctx.body.state}&redirect_url=${ctx.body.url}`)
}

exports.delete = async ctx => {
  let body = {
    clientId: ctx.params.id
  }
  verify({ data: body.clientId, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  await authServer.delete(ctx.getUserId(), body.clientId)
  ctx.state = 200
}
