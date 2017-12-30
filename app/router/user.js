const Router = require('koa-router')
const userCtrl = require('../controller/user')
const user = new Router()

user.get('/login', userCtrl.loginState) // 检查登陆状态
user.post('/login', userCtrl.login) // 登陆
user.delete('/login', userCtrl.logout) // 退出登陆
user.post('/register', userCtrl.register) // 注册
user.post('/password', userCtrl.changePassword) // 更改密码
user.post('/email', userCtrl.validEmail) // 认证邮箱
user.get('/baseInfo', userCtrl.getBaseInfo) // 获取用户基本信息
user.patch('/baseInfo', userCtrl.patchBaseInfo) // 更新用户基本信息
user.put('/avatar', userCtrl.avatar)

module.exports = user
