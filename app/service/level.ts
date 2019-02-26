import * as assert from '../../lib/assert'
import * as levelModel from '../model/level'
import * as userModel from '../model/user'

export async function getRequestsByUserId(id: string, page: number, limit: number, state?: number): Promise<void> {}

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
