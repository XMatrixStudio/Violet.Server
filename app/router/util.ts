import * as Router from 'koa-router'

import * as ctrl from '../controller/util'

const util = new Router()

util.get('/captcha', ctrl.getCaptcha) // 获取图形验证码

export = util
