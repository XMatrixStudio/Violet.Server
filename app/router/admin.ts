import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as adminCtrl from '../controller/admin'

const admin = new Router<IState, ICustom>()

admin.get('/requests', adminCtrl.getRequests) // 获取申请列表

export = admin
