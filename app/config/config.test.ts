import { Config, initDefaultConfig, getHttpUrl } from './config'

beforeAll(() => {
  initDefaultConfig('config.example.yml')
})

// getMongoUrl
describe('Test function getMongoUrl', () => {
  test.todo('by default config')

  test.todo('by specified config')
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
