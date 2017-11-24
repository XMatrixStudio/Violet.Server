const Router = require('koa-router')
const userCtrl = require('../controller/user')
const user = new Router()

user.post('/login', userCtrl.login) // 登陆
user.delete('/login', userCtrl.logout) // 退出登陆
user.post('/register', userCtrl.register) // 注册
user.post('/password', userCtrl.changePassword) // 更改密码
user.post('/email', userCtrl.validEmail) // 认证邮箱
module.exports = user