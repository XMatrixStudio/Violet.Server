const Router = require('koa-router')
const clientCtrl = require('../controller/client')
const client = new Router()

client.put('/key/:id', clientCtrl.changeKey)
client.get('/list', clientCtrl.getList)
client.post('/', clientCtrl.add)
client.get('/:id', clientCtrl.getInfo)
client.patch('/:id', clientCtrl.setInfo)
client.delete('/:id', clientCtrl.delete)
module.exports = client
