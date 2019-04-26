import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as orgCtrl from '../controller/org'

const org = new Router<IState, ICustom>()

org.post('/', orgCtrl.post) // 创建组织
org.get('/:name/apps', orgCtrl.getByNameApps) // 获取组织的应用列表
org.post('/:name/members', orgCtrl.postByNameMembers) // 添加组织成员

export = org
