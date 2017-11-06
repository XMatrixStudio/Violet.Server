const assert = require('./assert')

/**
 * 检查类型
 * @param  {object} option
 * @param  {any} option.data
 * @param  {string} option.type
 *                 boolean:         原值为 true 或者 false
 *                 number:          原值为 非NaN非Infinity 的数字
 *                 positive:        原值为 非NaN非Infinity 的正数
 *                 non-negative:    原值为 非NaN非Infinity 的非负数字
 *                 string:          原值为 非空 字符串
 *                 date:            原值为 非Invalid Date
 *                 future:          原值为 非Invalid 且大于现在的Date
 *                 positive-array:  原值为 非NaN非Infinity正数 组成的 非空数组
 *                 e-positive-array:原值为 非NaN非Infinity正数 组成的 可空数组
 *                 string-array:    原值为 非空字符串 组成的 非空数组
 * @param  {string}  [option.message='invalid data'] 不满足类型时的错误消息
 * @param  {number} [option.maxLength=0] 字符串最大长度 默认不做限制
 * @param  {number} [option.minLength=0] 字符串最小长度 默认不做限制
 * @param  {regExp} [option.regExp=0] 字符串需要匹配的正则表达式 默认不做限制
 * @param  {boolean}  [option.require=true] 如果有false则允许为null或undefined
 */
module.exports = function(...options) {
  for (const option of options) {
    const message = option.message || 'invalid data'
    let realType = typeof option.data
    if (option.require === false) {
      if (option.data === null || realType === 'undefined') {
        continue
      }
    }
    switch (option.type) {
      case 'boolean':
        assert(realType === 'boolean', message)
        break
      case 'number':
        assert(realType === 'number' && !isNaN(option.data) && Number.isFinite(option.data), message)
        break
      case 'positive':
        assert(realType === 'number' && !isNaN(option.data) && Number.isFinite(option.data) && option.data > 0, message)
        break
      case 'non-negative':
        assert(realType === 'number' && !isNaN(option.data) && Number.isFinite(option.data) && option.data >= 0, message)
        break
      case 'string':
        assert(realType === 'string' && option.data.length, message)
        if (option.maxLength) assert(option.data.length <= option.maxLength, message)
        if (option.minLength) assert(option.data.length >= option.minLength, message)
        if (option.regExp) assert(option.regExp.test(option.data), message)
        break
      case 'date':
        assert(option.data instanceof Date && !isNaN(option.data.getTime()), message)
        break
      case 'future':
        assert(option.data instanceof Date && !isNaN(option.data.getTime()) && option.data > new Date(), message)
        break
      case 'positive-array':
        assert(Array.isArray(option.data) && option.data.length, message)
        for (const item of option.data) {
          assert(typeof item === 'number' && !isNaN(item) && Number.isFinite(item) && item > 0, message)
        }
        break
      case 'e-positive-array':
        assert(Array.isArray(option.data), message)
        for (const item of option.data) {
          assert(typeof item === 'number' && !isNaN(item) && Number.isFinite(item) && item > 0, message)
        }
        break
      case 'string-array':
        assert(Array.isArray(option.data) && option.data.length, message)
        for (const item of option.data) {
          assert(typeof item === 'string' && item.length, message)
        }
        break
    }
  }
}
