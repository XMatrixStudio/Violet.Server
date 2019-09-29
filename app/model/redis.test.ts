import * as init from '../../test'
import * as redis from './redis'

init.initTestCacheDB()

afterAll(async () => {
  await init.finishTestCacheDB()
})

// get, set, del
describe('Function get, set, del', () => {
  test('get not exist key', async () => {
    expect(await redis.get('test')).toBeNull()
  })

  test('set and get', async () => {
    expect(await redis.set('test', 'XMatrix')).toBe('OK')
    expect(await redis.get('test')).toBe('XMatrix')
  })

  test('del exist key', async () => {
    expect(await redis.del('test')).toBe(1)
    expect(await redis.get('test')).toBeNull()
  })

  test('del not exist key', async () => {
    expect(await redis.del('test')).toBe(0)
  })
})
