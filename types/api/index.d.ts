interface PageQuery {
  page: number | string
  limit: number | string
}

interface PageRes {
  page: number
  limit: number
  total: number
}
