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

/**
 * @method GET
 * @resource `/i/apps/:nameOrId`
 */
declare namespace GetAppsByNameOrId {
  interface Query {
    all: boolean
  }
  interface ResBody {
    id: string
    name: string
    owner: {
      name: string
      type: 'user' | 'org'
    }
    createTime: Date | string
    state: number
    type: number
    info: {
      avatar: string
      description: string
      url: string
    }
  }
}
