const mongoose = require('mongoose')
const { mongo } = require('../config')
mongoose.connect(`mongodb://${mongo.user}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.dbName}`, { useMongoClient: true })
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', () => { console.error.bind(console, 'connection error:') }) // 发生错误
db.on('disconnected', () => { console.log('Mongoose connection disconnected') }) // 连接断开
db.on('connected', () => { console.log('Mongoose connection Success') }) // 连接成功
module.exports = mongoose
