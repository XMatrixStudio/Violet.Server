// Context上下文定义

import { Context as KoaContext } from 'koa'
import { RouterContext } from 'koa-router'

declare interface IState {
  passLoginStatusCheck: boolean
}

declare type ICustom = KoaContext

declare type AppContext = KoaContext
declare type Context = RouterContext<IState, ICustom>
