import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as userCtrl from '../controller/user'

const user = new Router<IState, ICustom>()

user.post('/', userCtrl.post) // 注册
user.patch('/', userCtrl.patch) // 修改用户个人信息
user.get('/:name', userCtrl.getByName) // 获取用户基本信息
user.get('/:name/orgs', userCtrl.getOrgsByName) // 获取用户的组织列表
user.get('/auths', userCtrl.getAuths) // 获取授权列表
user.post('/auths', userCtrl.postAuths) // 添加授权
user.delete('/auths', userCtrl.deleteAuths) // 删除授权
user.get('/auths/:app', userCtrl.getAuthsByApp) // 获取授权信息
user.post('/email', userCtrl.postEmail) // 发送邮箱验证邮件
user.put('/email', userCtrl.putEmail) // 验证邮箱
user.post('/levels', userCtrl.postLevels) // 申请更改用户等级
user.post('/levels/apps', userCtrl.postLevelsApps) // 申请提高用户应用上限
user.post('/levels/orgs', userCtrl.postLevelsOrgs) // 申请提高用户组织上限
user.post('/phone', userCtrl.postPhone) // 发送手机验证短信
user.put('/phone', userCtrl.putPhone) // 验证手机
user.post('/session', userCtrl.postSession) // 用户登陆
user.delete('/session', userCtrl.deleteSession) // 用户退出登录

export = user
