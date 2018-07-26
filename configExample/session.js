// Session配置
module.exports = {
  // cookie secret key
  cookieKey: ['cookieKey'],
  // cookie name
  key: 'key',
  // 15 day
  maxAge: 1296000000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
}
