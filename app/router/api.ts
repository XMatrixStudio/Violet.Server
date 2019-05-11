import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as apiCtrl from '../controller/api'

const api = new Router<IState, ICustom>()

api.get('/users/info', apiCtrl.getUser) // 获取用户基本信息
api.get('/util/secret', apiCtrl.getUtilSecret) // 获取AppSecret
api.post('/verify/password', apiCtrl.postVerifyPassword) // 通过密码登陆获取Code
api.post('/verify/token', apiCtrl.postVerifyToken) // 获取授权Token

export = api
