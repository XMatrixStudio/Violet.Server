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
 * @resource `/i/users/:name`
 */
declare namespace GetUsersByName {
  interface ResBody {
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
      app: {
        limit?: number
        own: number
      }
      org: {
        limit?: number
        own: number
        join: number
      }
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
 * @resource `/i/users/:name/apps`
 */
declare namespace GetUsersByNameApps {
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
 * @resource `/i/users/:name/orgs`
 */
declare namespace GetUsersByNameOrgs {
  interface IOrg {
    name: string
    members: number
    apps: number
    avatar: string
    description: string
    location: string
  }
  interface Query extends PageQuery {}
  interface ResBody {
    pagination: PageRes
    data: IOrg[]
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
 * @resource `/i/users/levels`
 */
declare namespace PostUsersLevels {
  interface ReqBody {
    level: 1 | 50 | 99
    name: string
    email: string
    phone: string
    remark: string
  }
}

/**
 * @method POST
 * @resource `/i/users/levels/apps`
 */
declare namespace PostUsersLevelsApps {
  interface ReqBody {
    remark: string
  }
}

/**
 * @method POST
 * @resource `/i/users/levels/orgs`
 */
declare namespace PostUsersLevelsOrgs {
  interface ReqBody {
    remark: string
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
