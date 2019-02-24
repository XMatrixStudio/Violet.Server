import * as Router from 'koa-router'

import * as utilCtrl from '../controller/util'

const utilRouter = new Router()

utilRouter.get('/captcha', utilCtrl.getCaptcha) // 获取图形验证码

export = utilRouter
