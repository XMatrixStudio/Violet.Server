const Router = require('koa-router')
const utilCtrl = require('../controller/util')
const util = new Router()

util.get('/vCode', utilCtrl.getVCode)

module.exports = util
