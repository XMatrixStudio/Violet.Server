import * as init from '../../test'
import * as user from './user'

init.initTestCacheDB()
init.initTestDB()

afterAll(async () => {
  await init.finishTestCacheDB()
  await init.finishTestDB()
})

test.todo('')
