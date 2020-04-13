export interface IConfig {
  app: IAppConfig
  db: IMySQLConfig
  email: IEmailConfig
}

export interface IAppConfig {
  env: 'prod' | 'dev' | 'test'
  port: number
}
export interface IEmailConfig {
  host: string
  port: number
  user: string
  password: string
}

export interface IMySQLConfig {
  host: string
  port: number
  dbname: string
  user: string
  password: string
}
