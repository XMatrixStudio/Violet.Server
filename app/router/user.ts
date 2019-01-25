import * as Router from 'koa-router'

import * as ctrl from '../controller/user'

const user = new Router()

user.get('/', ctrl.get) // 获取用户基本信息
user.post('/', ctrl.post) // 注册
user.post('/email', ctrl.postEmail) // 发送邮箱认证邮件
user.post('/session', ctrl.postSession) // 用户登陆
user.delete('/session', ctrl.deleteSession) // 用户退出登录

export = user
