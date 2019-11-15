import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { IAppConfig, IConfig, IMySQLConfig } from './config.entity'

@Injectable()
export class ConfigService {
  private static config: IConfig
  private static path: string

  static getAppConfig(): IAppConfig {
    return ConfigService.config.app
  }

  static init(path: string) {
    ConfigService.config = yaml.safeLoad(fs.readFileSync(path, 'utf-8')) as IConfig
    ConfigService.path = path
  }

  getDBConfig(): IMySQLConfig {
    return ConfigService.config.db
  }
}
