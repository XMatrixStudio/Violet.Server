import * as Koa from 'koa'
import * as cors from '@koa/cors'
import * as bodyParser from 'koa-bodyparser'
import * as helmet from 'koa-helmet'
import * as morgan from 'koa-morgan'
import * as session from 'koa-session'

import * as router from './router'

const app = new Koa()
const isDev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 30002

// HTTP log
if (isDev) app.use(morgan('dev'))

// HTTPS 安全
app.use(helmet())
app.use(cors({ credentials: true }))

// Session
app.keys = ['cookieKey']
app.use(
  session(
    {
      key: 'key',
      maxAge: 1296000000,
      overwrite: true,
      httpOnly: true,
      signed: true,
      rolling: false
    },
    app
  )
)

// JSON and form to object
app.use(bodyParser())

// Routes
app.use(router.routes())

// 异常处理
// 404的错误不会捕捉
app.on('error', (error: Error) => {
  // TODO: err.expose判断
  console.log(error.stack)
})

app.listen(port)
console.log('Listen at port', port)
