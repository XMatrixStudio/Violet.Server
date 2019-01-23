import * as Router from 'koa-router'

import * as ctrl from '../controller/user'

const user = new Router()

user.get('/', ctrl.getUser) // 获取用户基本信息
user.post('/', ctrl.postUser) // 注册
user.post('/session', ctrl.postUserSession) // 用户登陆
user.delete('/session', ctrl.deleteUserSession) // 用户退出登录

export = user
