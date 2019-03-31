import { Config, initDefaultConfig, getHttpUrl, getMongoUrl } from './config'

beforeAll(() => {
  initDefaultConfig('config.example.yml')
})

// getMongoUrl
describe('Test function getMongoUrl', () => {
  test('by default config', () => {
    expect(getMongoUrl()).toBe('mongodb://violet:violet_pwd@127.0.0.1:27017/violet_db')
  })

  test('by specified config', () => {
    const conf: Config = {
      db: { mongo: { user: 'user', password: 'pwd', host: 'xmatrix.studio', port: 23456, dbName: 'test_db' } }
    } as Config
    expect(getMongoUrl(conf)).toBe('mongodb://user:pwd@xmatrix.studio:23456/test_db')
  })
})

// getHttpUrl
describe('Test function getHttpUrl', () => {
  test('by default config', () => {
    expect(getHttpUrl()).toBe('127.0.0.1:40002')
  })

  test('by specified config', () => {
    expect(getHttpUrl({ http: { host: '0.0.0.0', port: 80, dev: false } } as Config)).toBe('0.0.0.0:80')
  })
})
