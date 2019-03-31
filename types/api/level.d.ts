declare namespace Levels {
  // 用户等级
  interface ILevel {
    level: number
    app: number
    org: number
    auto_pass: boolean
    request_access: boolean
  }

  namespace GET {
    type ResponseBody = ILevel[]
  }

  namespace POST {
    type RequestBody = ILevel
  }

  namespace PUT {
    type RequestBody = ILevel
  }

  namespace DELETE {
    interface Query {
      level: number | string
    }
  }
}

declare namespace Levels.Users {
  namespace GET {
    interface Query {
      page: number | string
      limit: number | string
      state: number | string
      self: boolean | string
    }

    interface ResponseBody {
      pagination: {
        page: number
        limit: number
        total: number
      }
      data: Data[]
    }

    interface Data {
      name: string
      old_level: number
      level: number
      reason: string
      time: Date
      state: 0 | 1 | 2 | 3
    }
  }

  namespace POST {
    interface RequestBody {
      level: number
      reason: string
    }
  }
}
