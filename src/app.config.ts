import * as fs from 'fs'
import * as yaml from 'js-yaml'

interface IConfig {
  app: IAppConfig
  db: IMySQLConfig
}

interface IAppConfig {
  port: number
}

interface IMySQLConfig {
  host: string
  password: string
  port: number
  user: string
}

export let AppConfig = ({} as unknown) as IAppConfig
export let DBConfig = ({} as unknown) as IMySQLConfig

export function initConfig(path: string) {
  const config = yaml.safeLoad(fs.readFileSync(path, 'utf-8')) as IConfig
  AppConfig = config.app
  DBConfig = config.db
}
