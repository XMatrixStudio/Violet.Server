import * as program from 'commander'

import { initDefaultConfig, getHttpUrl } from './app/config/config'
import * as app from './app'

program
  .version('3.0.0-alpha', '-v, --version')
  .option('-c, --config <file>', 'specify configuration file', undefined, 'config.yml')
  .parse(process.argv)

// 如果加载配置文件失败，直接退出程序
if (!initDefaultConfig(program.config)) process.exit(1)
console.log('Use config file', program.config)

// app.listen(getHttpUrl())
console.log('Listen at host', getHttpUrl())
