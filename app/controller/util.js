const util = require('../../lib/util')

exports.getVCode = async ctx => {
  let rank = parseInt(Math.random() * 9000 + 1000)
  ctx.session.vCode = rank
  ctx.body = await util.getVCode(rank)
}
