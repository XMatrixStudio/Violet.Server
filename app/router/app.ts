import * as Router from 'koa-router'

import * as appCtrl from '../controller/app'

const app = new Router()

app.post('/', appCtrl.post) // 创建应用

export = app
