import * as Router from 'koa-router'

import * as userCtrl from '../controller/user'

const user = new Router()

user.get('/', userCtrl.get) // 获取用户基本信息
user.post('/', userCtrl.post) // 注册
user.patch('/', userCtrl.patch) // 修改用户个人信息
user.post('/email', userCtrl.postEmail) // 发送邮箱验证邮件
user.put('/email', userCtrl.putEmail) // 验证邮箱
user.post('/phone', userCtrl.postPhone) // 发送手机验证短信
user.put('/phone', userCtrl.putPhone) // 验证手机
user.post('/session', userCtrl.postSession) // 用户登陆
user.delete('/session', userCtrl.deleteSession) // 用户退出登录

export = user
