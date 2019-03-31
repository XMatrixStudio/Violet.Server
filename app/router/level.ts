import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as levelCtrl from '../controller/level'

const level = new Router<IState, ICustom>()

level.get('/', levelCtrl.get) // 获得用户等级列表
level.post('/', levelCtrl.post) // 创建用户等级
level.put('/', levelCtrl.put) // 修改用户等级
level.del('/', levelCtrl.del) // 删除用户等级
level.get('/users', levelCtrl.getUsers) // 获取申请列表
level.post('/users', levelCtrl.postUsers) // 申请修改用户等级

export = level
