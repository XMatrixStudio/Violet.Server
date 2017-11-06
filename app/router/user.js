const Router = require('koa-router')
const userCtrl = require('../controller/user')
const user = new Router()

user.post('/login', userCtrl.login)
user.post('/register', userCtrl.register)

module.exports = user
