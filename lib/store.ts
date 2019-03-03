import * as userModel from '../app/model/user'
import * as redis from './redis'

export async function getUserLevelById(userId: string): Promise<number> {
  const levelStr = await redis.get(`level-${userId}`)
  if (levelStr === null) {
    const level = (await userModel.getById(userId))!.level
    setUserLevelById(userId, level)
    return level
  }
  return parseInt(levelStr)
}

export async function setUserLevelById(userId: string, level: number): Promise<void> {
  await redis.set(`level-${userId}`, level.toString(), 15 * 24 * 60 * 60 * 1000)
}
