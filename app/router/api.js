const Router = require('koa-router')
const apiCtrl = require('../controller/api')
const api = new Router()

api.get('/users/BaseData', apiCtrl.getBaseData)
api.get('/verify/Token', apiCtrl.getToken)
api.post('/api/Login', apiCtrl.login)
api.post('/api/Register', apiCtrl.register)
api.post('/api/ChangePassword', apiCtrl.changePassword)
api.post('/api/GetEmailCode', apiCtrl.getEmailCode)
module.exports = api
