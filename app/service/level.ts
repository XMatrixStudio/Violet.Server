import * as assert from '../../lib/assert'
import * as levelModel from '../model/level'
import * as userModel from '../model/user'

/**
 * 创建用户等级
 * @param {number} level 用户等级
 * @param {number} app 可创建应用的数量上限，-1为无穷
 * @param {number} org 可创建组织的数量上限，-1为无穷
 * @param {boolean} autoPass 是否免除审核
 * @param {boolean} requestAccess 是否允许申请
 */
export async function addLevel(level: number, app: number, org: number, autoPass: boolean, requestAccess: boolean): Promise<void> {
  assert(!(await levelModel.getByLevel(level)), 'exist_level')
  await levelModel.add({ level: level, appLimit: app, orgLimit: org, autoPass: autoPass, requestAccess: requestAccess })
}

/**
 * 获取所有用户等级
 * @returns {ResponseBody} 用户等级信息列表
 */
export async function getLevels(): Promise<Levels.GET.ResponseBody> {
  const levels = await levelModel.getLevels()
  const data: Levels.GET.ResponseBody = []
  for (const i in levels) {
    data[i] = {
      level: levels[i].level,
      app: levels[i].appLimit,
      org: levels[i].orgLimit,
      auto_pass: levels[i].autoPass,
      request_access: levels[i].requestAccess
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
 * @returns {ResponseBody} 用户申请信息和页数信息
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
 * 删除用户等级
 * @param {number} level 用户等级
 */
export async function removeLevel(level: number): Promise<void> {
  // TODO: 判断是否存在该用户等级的用户
  await levelModel.removeByLevel(level)
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

/**
 * 更新用户等级
 * @param {number} level 用户等级
 * @param {number} app 可创建应用的数量上限，-1为无穷
 * @param {number} org 可创建组织的数量上限，-1为无穷
 * @param {boolean} autoPass 是否免除审核
 * @param {boolean} requestAccess 是否允许申请
 */
export async function updateLevel(level: number, app: number, org: number, autoPass: boolean, requestAccess: boolean): Promise<void> {
  assert(await levelModel.getByLevel(level), 'not_exist_level')
  await levelModel.updateByLevel(level, { appLimit: app, orgLimit: org, autoPass: autoPass, requestAccess: requestAccess })
}
