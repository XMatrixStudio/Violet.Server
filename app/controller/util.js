const util = require('../../lib/util')
const userService = require('../service/user')
const clientService = require('../service/client')
const verify = require('../../lib/verify')
const _ = require('lodash')

exports.getVCode = async ctx => {
  let rank = parseInt(Math.random() * 9000 + 1000)
  ctx.body = await util.getVCode(rank)
}

exports.getEmailCode = async ctx => {
  let body = _.pick(ctx.request.body, ['email'])
  verify({ data: body.email, type: 'string', maxLength: 64, regExp: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: 'invalid_email' })
  await userService.getEmailCode(body.email)
  ctx.state = 200
}

exports.getClientInfo = async ctx => {
  verify({ data: ctx.params.clientId, type: 'string', maxLength: 24, minLength: 24, message: 'error_clientId' })
  let clientInfo = await clientService.getClientInfo(ctx.params.clientId)
  ctx.body = clientInfo
}
