export interface IConfig {
  app: IAppConfig
  db: IMySQLConfig
}

export interface IAppConfig {
  port: number
}

export interface IMySQLConfig {
  dbname: string
  host: string
  password: string
  port: number
  user: string
}
