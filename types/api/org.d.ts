/**
 * @method POST
 * @resource `/i/orgs`
 */
declare namespace PostOrgs {
  interface ReqBody {
    avatar?: string
    contact: string
    description: string
    displayName: string
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
    displayName: string
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

/**
 * @method POST
 * @resource `/i/orgs/:name/members`
 */
declare namespace PostOrgsByNameMembers {
  interface ReqBody {
    user: string
  }
}
