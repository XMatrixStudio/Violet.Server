/**
 * @method POST
 * @resource `/verify/token`
 */
declare namespace PostVerifyToken {
  interface ReqBody {
    appSecret: string
    code: string
    grantType: string
    state: string
  }
}
