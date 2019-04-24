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

/**
 * @method GET
 * @resource `/i/orgs/:name/apps`
 */
declare namespace GetOrgsByNameApps {
  interface IApp {
    id: string
    name: string
    state: number
    avatar: string
    description: string
  }
  interface Query extends PageQuery {}
  interface ResBody {
    pagination: PageRes
    data: IApp[]
  }
}
