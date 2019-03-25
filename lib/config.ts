import * as fs from 'fs'
import * as yaml from 'js-yaml'

/**
 * Violet配置
 */
interface Config {
  http: HTTPConfig
  file: FileConfig
  db: DBConfig
  cache: CacheConfig
  email: EmailConfig
}

/**
 * 服务器配置
 */
interface HTTPConfig {
  host: string
  port: string
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
  from: string
}

/**
 * 获取配置信息
 *
 * @param {string} path 配置文件路径
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
