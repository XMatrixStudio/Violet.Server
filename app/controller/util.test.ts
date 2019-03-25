import * as request from 'supertest'

import * as app from '../index'

const url = '/i/util/captcha'

describe(`GET ${url}`, () => {
  it('should get captcha successfully', () => {
    return request(app.callback())
      .get(url)
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect(/^data:image\/png;base64,/)
  })
})
