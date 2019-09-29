import mongoose = require('mongoose')

export default mongoose

export function connect(url: string) {
  mongoose.connect(url, { useNewUrlParser: true, useFindAndModify: false })
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true)

  const db = mongoose.connection
  // 发生错误
  db.on('error', () => {
    console.error.bind(console, 'connection error:')
  })

  // 连接断开
  db.on('disconnected', () => {
    console.log('Mongoose connection disconnected')
  })

  // 连接成功
  db.on('connected', () => {
    console.log('Mongoose connection Success')
  })
}

export async function disconnect() {
  await mongoose.disconnect()
}
