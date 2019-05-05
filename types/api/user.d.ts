/**
 * @method GET
 * @resource `/i/users`
 */
declare namespace GetUsers {
  interface IUser {
    id: string
    name: string
    nickname: string
    avatar: string
    email: string
    phone: string
  }
  interface Query extends PageQuery { name: string }
  interface ResBody {
    pagination: PageRes
    data: IUser[]
  }
}


/**
 * @method POST
 * @resource `/i/users`
 */
declare namespace PostUsers {
  interface ReqBody {
    name: string
    nickname: string
    password: string
  }
}

/**
 * @method PATCH
 * @resource `/i/users`
 */
declare namespace PatchUsers {
  interface ReqBody {
    info?: {
      avatar?: string
      bio?: string
      birthday?: Date | string
      email?: string
      gender?: 0 | 1 | 2
      location?: string
      nickname?: string
      phone?: string
      url?: string
    }
    secure?: {
      newPassword: string
      oldPassword: string
    }
  }
}

/**
 * @method GET
 * @resource `/i/users/auths`
 */
declare namespace GetUsersAuths {
  interface IAuth {
    appId: string
    time: Date
    duration: number
    scope: string[]
  }
  interface Query extends PageQuery {}
  interface ResBody {
    pagination: PageRes
    data: IAuth[]
  }
}

/**
 * @method POST
 * @resource `/i/users/auths`
 */
declare namespace PostUsersAuths {
  interface ReqBody {
    appId: string
    duration: number
    scope: string[]
  }
}

/**
 * @method PUT
 * @resource `/i/users/dev`
 */
declare namespace PutUsersDev {
  interface ReqBody {
    email: string
    name: string
    phone: string
  }
}

/**
 * @method POST
 * @resource `/i/users/email`
 */
declare namespace PostUsersEmail {
  interface ReqBody {
    captcha: string
    email: string
    operator: 'register' | 'reset' | 'update'
  }
}

/**
 * @method PUT
 * @resource `/i/users/email`
 */
declare namespace PutUsersEmail {
  interface ReqBody {
    code: string
    operator: 'register' | 'reset' | 'update'
    password?: string
  }
}

/**
 * @method POST
 * @resource `/i/users/phone`
 */
declare namespace PostUsersPhone {
  interface ReqBody {
    captcha: string
    operator: 'register' | 'reset' | 'update'
    phone: string
  }
}

/**
 * @method PUT
 * @resource `/i/users/phone`
 */
declare namespace PutUsersPhone {
  interface ReqBody {
    code: string
    operator: 'register' | 'reset' | 'update'
    password?: string
  }
}

/**
 * @method GET
 * @resource `/i/users/requests`
 */
declare namespace GetUsersRequests {
  interface IRequest {
    remark: string
    time: Date
    type: number
  }
  type ResBody = IRequest[]
}

/**
 * @method POST
 * @resource `/i/users/requests/levels`
 */
declare namespace PostUsersRequestsLevels {
  interface ReqBody {
    level: 1 | 50 | 99
    name?: string
    email?: string
    phone?: string
    remark?: string
  }
}

/**
 * @method POST
 * @resource `/i/users/requests/apps`
 */
declare namespace PostUsersRequestsApps {
  interface ReqBody {
    remark: string
  }
}

/**
 * @method POST
 * @resource `/i/users/requests/orgs`
 */
declare namespace PostUsersRequestsOrgs {
  interface ReqBody {
    remark: string
  }
}

/**
 * @method POST
 * @resource `/i/users/session`
 */
declare namespace PostUsersSession {
  interface ReqBody {
    user: string
    password: string
    remember?: boolean
  }
}

/**
 * @method GET
 * @resource `/i/users/:extUid`
 */
declare namespace GetUsersByExtUid {
  interface ResBody {
    id: string
    email?: string
    phone?: string
    name: string
    level: number
    createTime: Date
    info: {
      avatar: string
      nickname: string
      bio?: string
      birthday?: Date
      email?: string
      phone?: string
      gender?: number
      location?: string
      url?: string
    }
    dev?: {
      name?: string
      email?: string
      phone?: string
      appLimit?: number
      appOwn: number
      orgJoin: number
      orgLimit?: number
      orgOwn: number
    }
    log?: {
      login: {
        time: Date
        ip: string
      }[]
      password?: Date
    }
  }
}

/**
 * @method GET
 * @resource `/i/users/:uid/apps`
 */
declare namespace GetUsersByUidApps {
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
 * @resource `/i/users/:uid/orgs`
 */
declare namespace GetUsersByUidOrgs {
  interface IOrg {
    id: string
    name: string
    avatar: string
    displayName: string
  }
  interface Query extends PageQuery {}
  interface ResBody {
    pagination: PageRes
    data: IOrg[]
  }
}
