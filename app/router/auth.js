const Router = require('koa-router')
const authCtrl = require('../controller/auth')
const auth = new Router()

auth.get('/list', authCtrl.getList)
auth.get('/:id', authCtrl.get)
auth.post('/:id', authCtrl.auth)
auth.delete('/:id', authCtrl.delete)
module.exports = auth
