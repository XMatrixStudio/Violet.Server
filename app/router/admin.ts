import * as Router from 'koa-router'

import * as adminCtrl from '../controller/admin'

const admin = new Router()

admin.patch('/user', adminCtrl.patchUser) // 修改用户信息

export = admin
