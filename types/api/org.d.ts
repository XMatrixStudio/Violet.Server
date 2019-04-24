/**
 * @method POST
 * @resource `/i/orgs`
 */
declare namespace PostOrgs {
  interface ReqBody {
    contact: string
    description: string
    email: string
    name: string
    phone: string
  }
}
