import * as redis from 'redis'
import { redis as redisConfig } from './config'
import assert = require('./assert')

const client = redis.createClient({
  ...redisConfig
})

client.on('error', err => {
  console.log('Redis error ' + err)
})

client.on('connect', () => {
  console.log('Redis connection success')
})

client.on('ready', () => {
  console.log('Redis ready')
})

export function get(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.get(key, (err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

export function set(key: string, value: string, time?: number): Promise<string> {
  if (time === undefined) {
    return new Promise((resolve, reject) => {
      client.set(key, value, (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      })
    })
  }

  return new Promise((resolve, reject) => {
    client.set(key, value, 'EX', time, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

export function del(key: string): Promise<number> {
  return new Promise((resolve, reject) => {
    client.del(key, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

/*
  // test
  import * as redisClient from '../lib/redis'
  async function test() {
    console.log('get', await redisClient.get('test12')) // get null
    console.log('set', await redisClient.set('test12', '10086')) // set OK
    console.log('get', await redisClient.get('test12')) // get 10086
    console.log('del', await redisClient.del('test12')) // del 1
    console.log('get', await redisClient.get('test12')) // get null
  }
  test()
*/
