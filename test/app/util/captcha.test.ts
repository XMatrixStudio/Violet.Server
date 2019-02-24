import * as request from 'supertest'

import app = require('../../../app')

const url = '/i/util/captcha'

describe(`GET ${url}`, () => {
  it('should get captcha successfully', () => {
    return request(app)
      .get(url)
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect(/^data:image\/png;base64,/)
  })
})
