import { Config, getHttpUrl } from './config'

describe('Test function getHttpUrl', () => {
  it('should return 0.0.0.0:40002', () => {
    expect(getHttpUrl({ http: { host: '0.0.0.0', port: 40002, dev: false } } as Config)).toBe('0.0.0.0:40002')
  })

  it('should return 127.0.0.1:40003', () => {
    expect(getHttpUrl({ http: { host: '127.0.0.1', port: 80, dev: false } } as Config)).toBe('127.0.0.1:80')
  })
})
