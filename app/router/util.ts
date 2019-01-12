import * as Router from 'koa-router'

import * as ctrl from '../controller/util'

const util = new Router()

util.get('/vcode', ctrl.getVCode) // 获取图形验证码

export = util
