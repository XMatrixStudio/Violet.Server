import * as Router from 'koa-router'

import * as orgCtrl from '../controller/org'

const org = new Router()

org.post('/', orgCtrl.post) // 创建组织

export = org
