import * as Router from 'koa-router'

import * as classCtrl from '../controller/class'

const classRouter = new Router()

classRouter.post('/users', classCtrl.postUsers) // 修改用户信息

export = classRouter
