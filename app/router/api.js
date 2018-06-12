const Router = require('koa-router')
const apiCtrl = require('../controller/api')
const api = new Router()

api.post('/BaseData', apiCtrl.getBaseData)
api.post('/Token', apiCtrl.getToken)
api.post('/Login', apiCtrl.login)
api.post('/Register', apiCtrl.register)
api.post('/ChangePassword', apiCtrl.changePassword)
api.post('/GetEmailCode', apiCtrl.getEmailCode)
module.exports = api
