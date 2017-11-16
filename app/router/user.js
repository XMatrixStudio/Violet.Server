const Router = require('koa-router')
const userCtrl = require('../controller/user')
const user = new Router()

user.post('/login', userCtrl.login)
user.delete('/login', userCtrl.logout)
user.post('/register', userCtrl.register)
user.post('/password', userCtrl.changePassword)
module.exports = user
