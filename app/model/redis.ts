import { stores } from 'koa-session'
import * as redis from 'redis'

let client: redis.RedisClient | undefined = undefined

export function connect(options?: redis.ClientOpts) {
  client = redis.createClient(options)

  client.on('error', err => {
    console.log('Redis error ' + err)
  })

  client.on('connect', () => {
    console.log('Redis connection success')
  })

  client.on('ready', () => {
    console.log('Redis ready')
  })
}

export function disconnect(): Promise<'OK'> {
  return new Promise((resolve, reject) => {
    client!.quit((err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

export function flushDB(): Promise<'OK'> {
  return new Promise((resolve, reject) => {
    client!.flushdb((err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

export function getSessionStore(): stores {
  return {
    async get(key: string): Promise<any> {
      const res = await get(key)
      if (!res) return null
      return JSON.parse(res)
    },

    async set(key: string, value: any, maxAge: number) {
      maxAge = typeof maxAge === 'number' ? maxAge / 1000 : 86400
      value = JSON.stringify(value)
      await set(key, value, maxAge)
    },

    async destroy(key: string) {
      await del(key)
    }
  }
}

export function get(key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client!.get(key, (err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

export function set(key: string, value: string, time?: number): Promise<'OK'> {
  if (time === undefined) {
    return new Promise((resolve, reject) => {
      client!.set(key, value, (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve(result)
      })
    })
  }
  return new Promise((resolve, reject) => {
    client!.set(key, value, 'EX', time, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

export function del(key: string): Promise<number> {
  return new Promise((resolve, reject) => {
    client!.del(key, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}
