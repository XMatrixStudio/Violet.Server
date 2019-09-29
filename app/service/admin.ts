import * as requestModel from '../model/request'

export async function getRequests(page: number, limit: number, type?: number, state?: number): Promise<Admin.Requests.GET.ResponseBody> {
  const option: Partial<Record<'type' | 'state', number>> = {}
  if (type) option.type = type
  if (state) option.state = state
  const count = await requestModel.getListCount(option)
  const requests = await requestModel.getList(page, limit, option)
  const data: Admin.Requests.IRequest[] = []
  for (const i in requests) {
    data[i] = {
      name: requests[i]._target.rawName,
      time: requests[i].time,
      type: requests[i].type as 0 | 1 | 10 | 11 | 20,
      state: requests[i].state as 0 | 1 | 2,
      remark: requests[i].remark
    }
  }
  return {
    pagination: {
      page: page,
      limit: limit,
      total: count
    },
    data: data
  }
}
