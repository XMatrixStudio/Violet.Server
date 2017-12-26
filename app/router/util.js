const Router = require('koa-router')
const utilCtrl = require('../controller/util')
const util = new Router()

util.get('/vCode', utilCtrl.getVCode)
util.post('/EmailCode', utilCtrl.getEmailCode)
util.get('/ClientInfo/:clientId', utilCtrl.getClientInfo)

module.exports = util
