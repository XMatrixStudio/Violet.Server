import * as db from '../../lib/mongo'

interface Class extends db.Document {
  class: number // 用户级别
}
