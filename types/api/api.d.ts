/**
 * @method GET
 * @resource `/user`
 */
declare namespace ApiGetUser {
  interface Query {
    appSecret: string
    token: string
  }
  interface ResBody {
    id: string
    avatar: string
    bio?: string
    birthday?: Date
    email?: string
    gender?: number
    location?: string
    nickname: string
    phone?: string
    url?: string
  }
}

/**
 * @method GET
 * @resource `/util/secret`
 */
declare namespace ApiGetUtilSecret {
  interface Query {
    appId: string
    appKey: string
  }
  interface ResBody {
    appSecret: string
  }
}

/**
 * @method POST
 * @resource `/verify/token`
 */
declare namespace ApiPostVerifyToken {
  interface ReqBody {
    appSecret: string
    code: string
    grantType: string
  }
  interface ResBody {
    token: string
    userId: string
  }
}
