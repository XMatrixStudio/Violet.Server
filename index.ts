import * as program from 'commander'

import config, { initDefaultConfig, getMongoUrl, getHttpUrl } from './app/config/config'

program
  .version('3.0.0-alpha', '-v, --version')
  .option('-c, --config <file>', 'specify configuration file', 'config.yml')
  .parse(process.argv)

// 如果加载配置文件失败，直接退出程序
if (!initDefaultConfig(program.config)) process.exit(1)
console.log('Use config file', program.config)

// 在加载配置文件之后引入app模块
import * as app from './app'
import { connect } from './app/model'

connect(getMongoUrl())

app.listen(config!.http.port, config!.http.host)
console.log('Listen at host', getHttpUrl())
