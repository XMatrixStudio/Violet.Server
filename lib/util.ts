import * as reservedUsernames from 'github-reserved-names'

/**
 * 判断用户名是否保留字
 *
 * @param {string} username 用户名
 * @return {Boolean} 是否为保留字
 */
export const isReservedUsername = (username: string): boolean => {
  if (!username) return true
  if (username === 'me') return true
  return reservedUsernames.check(username.toString())
}
