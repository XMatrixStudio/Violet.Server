declare namespace Levels {
  namespace GET {
    interface ResponseBody {
      level: number | string
      app: number | string
      admin: boolean | string
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

