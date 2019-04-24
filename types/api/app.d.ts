/**
 * @method POST
 * @resource `/i/apps`
 */
declare namespace PostApps {
  interface ReqBody {
    avatar?: string
    callbackUrl: string
    description: string
    homeUrl: string
    name: string
    owner: string
    type: number
  }
}
