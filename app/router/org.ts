import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as orgCtrl from '../controller/org'

const org = new Router<IState, ICustom>()

org.post('/', orgCtrl.post) // 创建组织
org.get('/:extId', orgCtrl.getByExtId) // 获取组织信息
org.get('/:name/apps', orgCtrl.getByNameApps) // 获取组织的应用列表
org.get('/:id/members', orgCtrl.getByIdMembers) // 获取组织成员列表
org.post('/:id/members', orgCtrl.postByIdMembers) // 添加组织成员
org.put('/:id/members', orgCtrl.putByIdMembers) // 修改组织成员等级
org.delete('/:id/members/:userId', orgCtrl.deleteByIdMembersByUserId) // 移除组织成员

export = org
