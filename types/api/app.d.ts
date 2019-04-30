/**
 * @method POST
 * @resource `/i/apps`
 */
declare namespace PostApps {
  interface ReqBody {
    avatar?: string
    callbackHosts: string[]
    description: string
    displayName: string
    name: string
    owner: string
    type: number
    url: string
  }
}

/**
 * @method GET
 * @resource `/i/apps/:extId`
 */
declare namespace GetAppsByExtId {
  interface Query {
    all: boolean | string
  }
  interface ResBody {
    id: string
    name: string
    owner: {
      id: string
      name: string
      type: 'user' | 'org'
    }
    createTime: Date
    key?: string
    callbackHosts?: string[]
    state: number
    type: number
    info: {
      avatar: string
      description: string
      displayName: string
      url: string
    }
  }
}
