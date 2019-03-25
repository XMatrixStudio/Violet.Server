import * as program from 'commander'

import config from './lib/config'
// import * as app from './app'

program
  .version('3.0.0-alpha', '-v, --version')
  .option('-c, --config <file>', 'specify configuration file')
  .parse(process.argv)

console.log(program.config)

// 如果加载配置文件失败，直接退出程序
if (config === undefined) process.exit(1)
// app.listen(`${config!.http.host}:${config!.http.port}`)
console.log('Listen at port', config!.http.port)
