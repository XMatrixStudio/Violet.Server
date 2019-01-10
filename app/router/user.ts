import * as Router from 'koa-router'

import * as ctrl from '../controller/user'

const user = new Router()

user.get('/', ctrl.getUser) // 获取用户基本信息
user.post('/', ctrl.postUser) // 注册

export = user
