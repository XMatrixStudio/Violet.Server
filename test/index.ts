import { Config, initDefaultConfig, getMongoUrl } from '../app/config/config'
import { connect as dbConnect } from '../app/model'
import { connect as cacheConnect } from '../app/model/redis'

export function initTestConfig() {
  initDefaultConfig('config.example.yml')
}

export function initTestDB() {
  let exitFlag = false
  if (process.env.MONGO_TEST_HOST === undefined) {
    console.log('env [MONGO_TEST_HOST] not found')
    exitFlag = true
  }
  if (process.env.MONGO_TEST_PORT === undefined) {
    console.log('env [MONGO_TEST_PORT] not found')
    exitFlag = true
  }
  if (process.env.MONGO_TEST_PASSWORD === undefined) {
    console.log('env [MONGO_TEST_PASSWORD] not found')
    exitFlag = true
  }
  if (process.env.MONGO_TEST_USER === undefined) {
    console.log('env [MONGO_TEST_USER] not found')
    exitFlag = true
  }
  if (process.env.MONGO_TEST_DBNAME === undefined) {
    console.log('env [MONGO_TEST_DBNAME] not found')
    exitFlag = true
  }
  if (exitFlag) process.exit(1)
  dbConnect(
    getMongoUrl({
      db: {
        mongo: {
          host: process.env.MONGO_TEST_HOST,
          port: parseInt(process.env.MONGO_TEST_PORT!),
          password: process.env.MONGO_TEST_PASSWORD,
          user: process.env.MONGO_TEST_USER,
          dbName: process.env.MONGO_TEST_DBNAME
        }
      }
    } as Config)
  )
}

export function initTestCacheDB() {
  let exitFlag = false
  if (process.env.REDIS_TEST_HOST === undefined) {
    console.log('env [REDIS_TEST_HOST] not found')
    exitFlag = true
  }
  if (process.env.REDIS_TEST_PORT === undefined) {
    console.log('env [REDIS_TEST_PORT] not found')
    exitFlag = true
  }
  if (process.env.REDIS_TEST_PASSWORD === undefined) {
    console.log('env [REDIS_TEST_PASSWORD] not found')
    exitFlag = true
  }
  if (exitFlag) process.exit(1)
  cacheConnect({
    host: process.env.REDIS_TEST_HOST,
    port: parseInt(process.env.REDIS_TEST_PORT!),
    password: process.env.REDIS_TEST_PASSWORD,
    db: 2
  })
}
