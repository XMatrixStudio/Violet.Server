import * as request from 'supertest'

import { initTestConfig } from '../../test'
initTestConfig()

import * as app from '../'

describe('GET /i/util/captcha', () => {
  const url = '/i/util/captcha'

  it('should return 200', () => {
    return request(app.callback())
      .get(url)
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect(/^data:image\/png;base64,/)
  })
})
