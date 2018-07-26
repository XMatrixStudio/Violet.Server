const clientServer = require('../service/client')
const verify = require('../../lib/verify')
const assert = require('../../lib/assert')
const config = require('../../config/default')
const _ = require('lodash')

exports.getList = async ctx => {
  ctx.body = await clientServer.getList(ctx.session.userId)
}

exports.add = async ctx => {
  let clients = await clientServer.getList(ctx.session.userId)
  let user = await ctx.getUserData(ctx)
  assert(clients.length <= user.userClass, 'max_clients') // 达到上陝
  await clientServer.add(user._id)
  ctx.status = 200
}

exports.getInfo = async ctx => {
  let body = _.pick(ctx.params, ['id'])
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  let client = await clientServer.getInfo(body.id)
  client.icon = client.icon || config.avatar
  ctx.body = client
}

exports.setInfo = async ctx => {
  let body = _.pick(ctx.request.body, ['name', 'detail', 'url', 'callBack'])
  body.id = ctx.params.id
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  verify({ data: body.name, type: 'string', maxLength: 64, minLength: 1, message: 'invalid_name', require: false })
  verify({ data: body.detail, type: 'string', maxLength: 1024, minLength: 6, message: 'invalid_detail', require: false })
  verify({ data: body.url, type: 'string', maxLength: 512, minLength: 6, message: 'invalid_url', require: false })
  verify({ data: body.callBack, type: 'string', maxLength: 512, minLength: 6, message: 'invalid_callback', require: false })
  await clientServer.setInfo(body.id, {
    name: body.name,
    detail: body.detail,
    url: body.url,
    callBack: body.callBack
  })
  ctx.status = 200
}

exports.delete = async ctx => {
  let body = _.pick(ctx.params, ['id'])
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  await clientServer.delete(body.id)
  ctx.status = 200
}

exports.changeKey = async ctx => {
  let body = _.pick(ctx.params, ['id'])
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  await clientServer.changeKey(body.id)
  ctx.status = 200
}

exports.changeIcon = async ctx => {
  let body = _.pick(ctx.request.body, ['icon'])
  body.id = ctx.params.id
  verify({ data: body.id, type: 'string', maxLength: 24, minLength: 24, message: 'invalid_clientId' })
  verify({ data: body.icon, type: 'string', maxLength: 100000, message: 'invalid_icon' })
  clientServer.changeIcon(ctx.getUserId(ctx), body.id, body.icon)
  ctx.status = 200
}
