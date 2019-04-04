import * as request from 'supertest'

import * as init from '../../test'
import { AppContext } from '../../types/context'

init.initTestConfig()
init.initTestCacheDB()
init.initTestDB()

import * as app from '../'
const agent = request.agent(app.callback())

beforeAll(async () => {
  await init.finishTestCacheDB()
  await init.finishTestDB()
})

describe('POST /i/users/email', () => {
  const url = '/i/users/email'
  const captchaUrl = '/i/util/captcha'

  app.middleware.unshift(async (ctx: AppContext, next: () => Promise<void>) => {
    await next()
    if (ctx.request.path === captchaUrl) ctx.body = ctx.session!.verify
  })
  const agent = request.agent(app.callback())

  it.todo('return 201')

  it('return 400 with invalid_captcha', async () => {
    return agent
      .post(url)
      .send({ operator: 'register', captcha: '12345', email: 'a@xmatrix.studio' })
      .expect(400)
      .expect({ error: 'invalid_captcha' })
  })

  it.todo('return 400 with invalid_email')
  it.todo('return 400 with invalid_operator')
  it.todo('return 400 with error_captcha')
  it.todo('return 400 with not_exist_captcha')
  it.todo('return 400 with timeout_captcha')
  it.todo('return 400 with exist_user when register')
  it.todo('return 400 with not_exist_user when reset')
  it.todo('return 400 with same_email when update')
  it.todo('return 401 with invalid_token when update')
  it.todo('return 403 with ban_user when update')
})
