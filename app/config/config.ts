import * as fs from 'fs'
import * as yaml from 'js-yaml'

/**
 * Violet配置
 */
export interface Config {
  http: HttpConfig
  file: FileConfig
  db: DBConfig
  cache: CacheConfig
  email: EmailConfig
}

/**
 * 服务器配置
 */
interface HttpConfig {
  host: string
  port: number
  dev: boolean
}

/**
 * 静态文件系统配置
 * 可选方案：cos
 */
interface FileConfig {
  cos: {
    default: string
    secretId: string
    secretKey: string
    bucket: string
    region: string
    url: string
  }
}

/**
 * 数据库配置
 * 可选方案：mongo
 */
interface DBConfig {
  mongo: {
    user: string
    password: string
    host: string
    port: number
    dbName: string
  }
}

/**
 * 缓存数据库配置
 * 可选方案：redis
 */
interface CacheConfig {
  redis: {
    host: string
    port: number
    password: string
    db: number
  }
}

/**
 * 邮件系统配置
 */
interface EmailConfig {
  host: string
  port: number
  user: string
  password: string
  cipherKey: string
  from: {
    code: string
  }
}

// 默认导出将使用CommonJS模块标准
export default undefined as Config | undefined

/**
 * 初始化默认配置信息
 * @param {string} path 配置文件路径
 * @returns {boolean} 如果已经初始化或初始化失败，返回`false`；初始化成功返回`true`
 */
export function initDefaultConfig(path: string): boolean {
  if (exports.default !== undefined) return false
  exports.default = getConfig(path)
  return exports.default !== undefined
}

/**
 * 获取配置信息
 * @param {string} path 配置文件路径
 * @returns {Config | undefined} 返回配置信息，当解析失败或文件不存在时返回`undefined`
 */
export function getConfig(path: string): Config | undefined {
  try {
    const config: Config = yaml.safeLoad(fs.readFileSync(path, 'utf8'))
    return config
  } catch (err) {
    console.log(err)
    return undefined
  }
}

/**
 * 通过配置信息获取MongoDB的链接
 * @param {Config} [conf] 配置信息，为空时使用默认配置信息
 * @returns {string} Url
 */
export function getMongoUrl(conf?: Config): string {
  conf = conf || exports.default
  const mongo = conf!.db.mongo
  return `mongodb://${mongo.user}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.dbName}`
}

/**
 * 通过配置信息获取HTTP服务器的链接
 * @param {Config} [conf] 配置信息，为空时使用默认配置信息
 * @returns {string} Url
 */
export function getHttpUrl(conf?: Config): string {
  conf = conf || exports.default
  return `${conf!.http.host}:${conf!.http.port}`
}
