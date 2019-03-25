import { getConfig } from './lib/config'
import * as app from './app'

app.listen(config.server.port)
console.log('Listen at port', config.server.port)
