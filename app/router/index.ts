import * as Router from 'koa-router'

import * as user from './user'

const router = new Router()

router.use('/i/user', user.routes())

export = router
