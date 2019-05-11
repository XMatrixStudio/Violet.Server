import * as _ from 'lodash'

import { Context } from '../../types/context'

export async function getUsersInfo(ctx: Context) {}

export async function postVerifyPassword(ctx: Context) {}

export async function postVerifyToken(ctx: Context) {
  const body = _.pick<PostVerifyToken.ReqBody>(ctx.request.body, ['appSecret', 'code', 'grantType', 'state'])
}
