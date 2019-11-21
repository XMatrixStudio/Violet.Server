export interface IConfig {
  app: IAppConfig
  db: IMySQLConfig
}

export interface IAppConfig {
  env: 'prod' | 'dev' | 'test'
  port: number
}

export interface IMySQLConfig {
  dbname: string
  host: string
  password: string
  port: number
  user: string
}
