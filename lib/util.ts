import * as Captchapng from 'captchapng2'

/**
 * 生成验证码图片
 *
 * @param {number} value 四位验证码
 * @returns {string} PNG 图片验证码的Base64
 */
export const getVCode = (value: number): string => {
  const png = new Captchapng(80, 30, value)
  return 'data:image/png;base64,'.concat(png.getBase64())
}
