import * as assert from '../../lib/assert'
import * as levelModel from '../model/level'
import * as userModel from '../model/user'

export async function getLevels(): Promise<Levels.GET.ResponseBody> {
  const levels = await levelModel.getAllLevels()
  const data = new Array<Levels.GET.Data>()
  for (const i in levels) {
    data[i] = {
      level: levels[i].level,
      app: levels[i].appLimit,
      admin: levels[i].adminPermission
    }
  }
  return data
}

/**
 * 获取用户申请
 *
 * @param {string | undefined} userId 用户ObjectId, 为`undefined`时获取全部用户申请
 * @param {number | undefined} state 申请状态, 为`undefined`时获取全部状态的申请
 * @param {number} page 页数
 * @param {number} limit 每页数量
 */
export async function getRequests(
  userId: string | undefined,
  state: number | undefined,
  page: number,
  limit: number
): Promise<Levels.Users.GET.ResponseBody> {
  const option: Partial<{ _user: string; state: number }> = {}
  if (userId !== undefined) option._user = userId
  if (state !== undefined) option.state = state
  const count = await levelModel.getRequestsCount(option)
  const requests = await levelModel.getRequests(page, limit, option)
  const data = new Array<Levels.Users.GET.Data>()
  for (const i in requests) {
    data[i] = {
      name: requests[i]._user.rawName,
      old_level: requests[i]._user.level,
      level: requests[i].level,
      reason: requests[i].reason,
      time: requests[i].time,
      state: requests[i].state
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

/**
 * 申请修改用户等级
 *
 * @param {string} userId 用户ObjectId
 * @param {number} level 申请的用户等级
 * @param {string} reason 申请理由
 */
export async function requestUpdateUserLevel(userId: string, level: number, reason: string): Promise<void> {
  assert(level >= 0, 'ban_level')
  if (level === 99) {
    assert(!(await levelModel.getByLevel(99)), 'ban_level')
    await levelModel.init()
    await userModel.updateLevel(userId, 99)
  } else {
    assert(await levelModel.getByLevel(level), 'not_exist_level')
    const request = await levelModel.getOpenRequestByUserId(userId)
    assert(!request, 'exist_open_request')
    await levelModel.addRequest(userId, level, reason)
  }
}
