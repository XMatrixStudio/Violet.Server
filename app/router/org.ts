import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as orgCtrl from '../controller/org'

const org = new Router<IState, ICustom>()

org.post('/', orgCtrl.post) // 创建组织

export = org
