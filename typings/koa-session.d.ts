// koa-session的类型定义扩展
//
// 扩展内容：Violet中所有使用到的Session参数

import * as session from 'koa-session'

declare module 'koa-session' {
  /**
   * Session扩展模型
   */
  interface Session {
    vcode: string | number
  }
}
