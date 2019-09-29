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
 * @resource `/i/orgs/:extId`
 */
declare namespace GetOrgsByExtId {
  interface Query { all: boolean | string }
  interface ResBody {
    id: string
    name: string
    createTime: Date
    dev: {
      appLimit?: number
      appOwn: number
      memberLimit?: number
      memberOwn: number
    }
    info: {
      avatar: string
      contact: string
      description: string
      displayName: string
      email: string
      location: string
      phone: string
      url: string
    }
    permission?: {
      app: number
      invite: number
      member: number
    }
    myRole?: number
  }
}

/**
 * @method GET
 * @resource `/i/orgs/:id/apps`
 */
declare namespace GetOrgsByIdApps {
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
 * @method GET
 * @resource `/i/orgs/:id/members`
 */
declare namespace GetOrgsByIdMembers {
  interface IUser {
    id: string
    name: string
    nickname: string
    avatar: string
    email: string
    phone: string
    role: number
  }
  interface Query extends PageQuery {}
  interface ResBody {
    pagination: PageRes
    data: IUser[]
  }
}

/**
 * @method POST
 * @resource `/i/orgs/:id/members`
 */
declare namespace PostOrgsByIdMembers {
  interface ReqBody {
    userId: string
  }
}

/**
 * @method PUT
 * @resource `/i/orgs/:id/members`
 */
declare namespace PutOrgsByIdMembers {
  interface ReqBody {
    userId: string
    role: 0 | 1
  }
}
