import * as Router from 'koa-router'

import { IState, ICustom } from '../../types/context'
import * as appCtrl from '../controller/app'

const app = new Router<IState, ICustom>()

app.post('/', appCtrl.post) // 创建应用

export = app
