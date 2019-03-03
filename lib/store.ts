import * as userModel from '../app/model/user'

export async function getUserLevelById(userId: string): Promise<number> {
  return (await userModel.getById(userId))!.level
}

export async function setUserLevelById(userId: string, level: number): Promise<void> {
  // do nothing
}
