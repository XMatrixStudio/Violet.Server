import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as utilCtrl from '../controller/util'

const util = new Router<IState, ICustom>()

util.get('/captcha', utilCtrl.getCaptcha) // 获取图形验证码

export = util
