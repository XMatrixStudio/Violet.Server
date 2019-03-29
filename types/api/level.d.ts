declare namespace Levels {
  namespace GET {
    interface ResponseBody {
      [key: number]: Data
    }

    interface Data {
      level: number
      app: number
      org: number
      admin: boolean
    }
  }
  namespace POST {
    interface RequestBody {
      level: number
      app: number
      org: number
      auto_pass: boolean
      request_access: boolean
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
