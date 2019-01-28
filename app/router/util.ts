import * as Router from 'koa-router'

import * as utilCtrl from '../controller/util'

const util = new Router()

util.get('/captcha', utilCtrl.getCaptcha) // 获取图形验证码

export = util
