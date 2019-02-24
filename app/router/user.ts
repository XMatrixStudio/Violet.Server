import * as Router from 'koa-router'

import * as userCtrl from '../controller/user'

const userRouter = new Router()

userRouter.get('/', userCtrl.get) // 获取用户基本信息
userRouter.post('/', userCtrl.post) // 注册
userRouter.patch('/', userCtrl.patch) // 修改用户个人信息
userRouter.post('/email', userCtrl.postEmail) // 发送邮箱验证邮件
userRouter.put('/email', userCtrl.putEmail) // 验证邮箱
userRouter.post('/phone', userCtrl.postPhone) // 发送手机验证短信
userRouter.put('/phone', userCtrl.putPhone) // 验证手机
userRouter.post('/session', userCtrl.postSession) // 用户登陆
userRouter.delete('/session', userCtrl.deleteSession) // 用户退出登录

export = userRouter
