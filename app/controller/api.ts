import * as _ from 'lodash'

import * as assert from '../../lib/assert'
import * as regexp from '../../lib/regexp'
import { Context } from '../../types/context'
import * as apiService from '../service/api'
import * as userService from '../service/user'
import * as verify from '../../lib/verify'

export async function getUser(ctx: Context) {
  const body = _.pick<ApiGetUser.Query>(ctx.request.query, ['appSecret', 'token'])
  assert.v(
    { data: body.appSecret, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_app_secret' },
    { data: body.token, type: 'string', minLength: 128, maxLength: 1024, message: 'invalid_token' }
  )
  ctx.body = await apiService.getUser(body.token!, body.appSecret!)
  ctx.status = 200
}

export async function getUtilSecret(ctx: Context) {
  const body = _.pick<ApiGetUtilSecret.Query>(ctx.request.query, ['appId', 'appKey'])
  assert.v(
    { data: body.appId, type: 'string', regExp: regexp.Id, message: 'invalid_app_id' },
    { data: body.appKey, type: 'string', minLength: 24, maxLength: 24, message: 'invalid_app_key' }
  )
  ctx.body = await apiService.getSecret(body.appId!, body.appKey!)
  ctx.status = 200
}

export async function postVerifyPassword(ctx: Context) {}

export async function postVerifyToken(ctx: Context) {
  const body = _.pick<ApiPostVerifyToken.ReqBody>(ctx.request.body, ['appSecret', 'code', 'grantType'])
  assert.v(
    { data: body.appSecret, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_app_secret' },
    { data: body.code, type: 'string', minLength: 128, maxLength: 512, message: 'invalid_code' },
    { data: body.grantType, type: 'string', enums: ['authorization_code'], message: 'invalid_grant_type' }
  )
  ctx.body = await apiService.getToken(body.code!, body.appSecret!)
  ctx.status = 201
}

export async function getVerifyAuthorize(ctx: Context) {
  try {
    // 执行快速登陆
    verify.requireLogin(ctx)
    const body = _.pick<ApiGetVerifyAuthorize.Query>(ctx.request.query, ['responseType', 'appId', 'quickMode', 'redirectUrl', 'state'])
    assert(body.quickMode === 'true', 'not_quick_mode')
    assert(body.responseType === 'code', 'error_response_type')
    assert.v(
      { data: body.appId, type: 'string', regExp: regexp.Id, message: 'invalid_app_id' },
      { data: body.redirectUrl, type: 'string', message: 'invalid_redirect_url' },
      { data: body.state, type: 'string', message: 'invalid_state' }
    )
    if (body.redirectUrl![body.redirectUrl!.length - 1] !== '/') body.redirectUrl += '/'
    const auth = await userService.getAuth(ctx.session!.user.id!, body.appId!, body.redirectUrl!)
    ctx.redirect(body.redirectUrl + '?code=' + auth.code + '&state=' + body.state)
  } catch (error) {
    ctx.redirect('/account/auth?' + ctx.request.querystring)
  }
}
