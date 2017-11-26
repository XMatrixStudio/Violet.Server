const clientServer = require('../service/client')
const verify = require('../../lib/verify')
const assert = require('../../lib/assert')
const _ = require('lodash')

exports.getList = async ctx => {
  ctx.body = await clientServer.getList(ctx.session.userId)
}

exports.add = async ctx => {
  let body = _.pick(ctx.request.body, ['name', 'detail', 'url'])
  verify({ data: body.name, type: 'string', maxLength: 64, minLength: 6, message: 'invalid_name' })
  verify({ data: body.detail, type: 'string', maxLength: 1024, minLength: 6, message: 'invalid_detail' })
  verify({ data: body.url, type: 'string', maxLength: 512, minLength: 6, message: 'invalid_url' })
  let clients = await clientServer.getList(ctx.session.userId)
  let user = await ctx.getUserData()
  assert(clients.length <= user.class, 'max_clients') // 达到上限
  await clientServer.add(user._id, body.name, body.detail, body.url)
  ctx.state = 200
}

exports.getInfo = async ctx => {
  let body = _.pick(ctx.params, ['id'])
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  let client = await clientServer.getInfo(body.id)
  ctx.body = client
}

exports.setInfo = async ctx => {
  let body = _.pick(ctx.request.body, ['name', 'detail', 'url'])
  body.id = ctx.params.id
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  verify({ data: body.name, type: 'string', maxLength: 64, minLength: 6, message: 'invalid_name', require: false })
  verify({ data: body.detail, type: 'string', maxLength: 1024, minLength: 6, message: 'invalid_detail', require: false })
  verify({ data: body.url, type: 'string', maxLength: 512, minLength: 6, message: 'invalid_url', require: false })
  await clientServer.setInfo(body.id, {
    name: body.name,
    detail: body.detail,
    url: body.url
  })
  ctx.state = 200
}

exports.delete = async ctx => {
  let body = _.pick(ctx.params, ['id'])
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  await clientServer.delete(body.id)
  ctx.state = 200
}

exports.changeKey = async ctx => {
  let body = _.pick(ctx.params, ['id'])
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  await clientServer.changeKey(body.id)
  ctx.state = 200
}
