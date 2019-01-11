import * as userModel from '../model/user'

export const register = async () => {
  await userModel.add()
}
