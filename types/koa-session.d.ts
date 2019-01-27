// koa-session的类型定义扩展
//
// 扩展内容：Violet中所有使用到的Session参数

import * as session from 'koa-session'

declare module 'koa-session' {
  /**
   * Session扩展模型
   */
  interface Session {
    /**
     * 验证
     */
    verify: Verification
  }

  interface Verification {
    /**
     * 图形验证码
     */
    captcha?: string

    /**
     * 邮箱验证，5分钟过期
     */
    email?: string
    emailCode?: string
    emailTime?: number

    /**
     * 手机验证码，5分钟过期
     */
    phoneCode?: string
    phoneTime?: number
  }
}
