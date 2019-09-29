declare namespace Admin.Requests {
  interface IRequest {
    name: string
    type: 0 | 1 | 10 | 11 | 20
    state: 0 | 1 | 2 | 3
    remark: string
    time: Date
  }

  namespace GET {
    interface Query {
      page: number | string
      limit: number | string
      state?: number | string
      type?: number | string
    }

    interface ResponseBody {
      pagination: {
        page: number
        limit: number
        total: number
      }
      data: IRequest[]
    }
  }
}
