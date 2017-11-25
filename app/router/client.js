const Router = require('koa-router')
const clientCtrl = require('../controller/client')
const client = new Router()

client.get('/list', clientCtrl.getList)
client.get('/:id', clientCtrl.getInfo)
client.post('/', clientCtrl.add)
client.put('/key/:id', clientCtrl.changeKey)
client.patch('/:id', clientCtrl.setInfo)
client.delete('/:id', clientCtrl.delete)
module.exports = client
