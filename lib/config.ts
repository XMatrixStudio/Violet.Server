import * as fs from 'fs'
import * as yaml from 'js-yaml'

interface Config {
  avatar: Avatar
  email: Email
  mongo: Mongo
  server: Server
}

interface Avatar {
  default: string
}

interface Email {
  host: string
  port: number
  user: string
  password: string
  cipherKey: string
  from: string
}

interface Mongo {
  user: string
  password: string
  host: string
  port: number
  dbName: string
}

interface Server {
  port: number
}

const defaultDoc: Config = {
  avatar: {
    default: 'http://violet-1252808268.cosgz.myqcloud.com/0.png'
  },
  email: {} as any,
  mongo: {} as any,
  server: {
    port: 40002
  }
}

let configDoc
try {
  configDoc = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'))
} catch (err) {
  console.log(err)
}

const doc: Config = Object.assign(defaultDoc, configDoc)

export = doc
