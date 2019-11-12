import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { IAppConfig, IConfig, IMySQLConfig } from './config.entity'

@Injectable()
export class ConfigService {
  private static config: IConfig | undefined
  private static path: string

  getDBConfig(): IMySQLConfig {
    if (ConfigService.config === undefined) throw Error(`ConfigService doesn't initialize.`)
    return ConfigService.config.db
  }

  static getAppConfig(): IAppConfig {
    if (ConfigService.config === undefined) throw Error(`ConfigService doesn't initialize.`)
    return ConfigService.config.app
  }

  static init(path: string) {
    if (ConfigService.config !== undefined) throw Error('ConfigService has already initialized.')
    ConfigService.config = yaml.safeLoad(fs.readFileSync(path, 'utf-8')) as IConfig
    ConfigService.path = path
  }
}
