import * as fs from 'fs'
import * as yaml from 'js-yaml'

interface Config {
  avatar: Avatar
  email: Email
  mongo: Mongo
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

const doc: Config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'))

export = doc
