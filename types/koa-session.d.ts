// koa-session的类型定义扩展
//
// 扩展内容：Violet中所有使用到的Session参数

import * as session from 'koa-session'

declare module 'koa-session' {
  /**
   * Session扩展模型
   */
  interface Session {
    user: User
    verify: Verification
  }

  /**
   * 用户登陆记录, 通过`id`来判断是否存在记录
   */
  interface User {
    id?: string
    time?: number
    remember?: boolean
    register?: 'email' | 'phone'
    reset?: 'email' | 'phone'
  }

  interface Verification {
    /**
     * 图形验证码, 5分钟过期, 通过`captcha`来判断是否存在记录
     */
    captcha?: string
    captchaTime?: number

    /**
     * 邮箱验证, 5分钟过期, 通过`emailType`来判断是否存在记录
     */
    email?: string
    emailType?: string
    emailCode?: string
    emailTime?: number

    /**
     * 手机验证, 5分钟过期
     */
    phone?: string
    phoneType?: string
    phoneCode?: string
    phoneTime?: number
  }
}
