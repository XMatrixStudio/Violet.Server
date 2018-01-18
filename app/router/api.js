const Router = require('koa-router')
const apiCtrl = require('../controller/api')
const api = new Router()

api.get('/users/BaseData', apiCtrl.getBaseData)
api.get('/verify/Token', apiCtrl.getToken)
module.exports = api
