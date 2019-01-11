import * as fs from 'fs'
import * as yaml from 'js-yaml'

interface Config {
  mongo: Mongo
}

interface Mongo {
  user: string
  password: string
  host: string
  port: number
  dbName: string
}

const doc: Config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'))

export const mongo = doc.mongo
