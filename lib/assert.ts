import * as _assert from 'assert'
import * as _ from 'lodash'

/**
 * Assert断言接口
 */
interface Assert {
  /**
   * 简单断言，错误返回特定状态码
   *
   * @param {any} value 需要断言的值
   * @param {string | Error} message 断言消息
   * @param {number} status 状态码，默认为400
   */
  (value: any, message: string | Error, status?: number): void

  /**
   * 验证断言，通过选项进行验证，错误返回400状态码
   *
   * @param {Option} option 选项
   * @param {any} option.data 需要断言的值
   * @param {string} option.type
   *                 boolean:          原值为 true 或者 false
   *                 number:           原值为 非NaN 非Infinity 的数字
   *                 positive:         原值为 非NaN 非Infinity 的正数
   *                 non-negative:     原值为 非NaN 非Infinity 的非负数字
   *                 string:           原值为 非空 字符串
   *                 date:             原值为 非Invalid Date
   *                 past:             原值为 非Invalid 且小于现在的Date
   *                 future:           原值为 非Invalid 且大于现在的Date
   *                 positive-array:   原值为 非NaN 非Infinity正数 组成的 非空数组
   *                 e-positive-array: 原值为 非NaN 非Infinity正数 组成的 可空数组
   *                 string-array:     原值为 非空字符串 组成的 非空数组
   * @param {string} [option.message = 'invalid_data'] 不满足类型时的错误消息
   * @param {number} [option.maxLength = 0] 字符串最大长度 默认不做限制
   * @param {number} [option.minLength = 0] 字符串最小长度 默认不做限制
   * @param {RegExp} [option.regExp = 0] 字符串需要匹配的正则表达式 默认不做限制
   * @param {boolean} [option.require = true] 如果有false 则允许为 null 或 undefined
   * @param {any} [option.min] 用于<=比较
   * @param {any} [option.max] 用于>=比较
   * @param {any[]} [option.enums = []] 枚举数组
   */
  v: (...options: Option[]) => void
}

/**
 * 断言选项
 */
interface Option {
  data: any
  type: string

  message?: string
  require?: boolean
  minLength?: number
  maxLength?: number
  min?: any
  max?: any
  enums?: any[]
  regExp?: RegExp
}

const assert = <Assert>function(value: any, message: string | Error, status: number = 400) {
  try {
    _assert(value, message)
  } catch (err) {
    err.status = status
    err.expose = true
    throw err
  }
}

assert.v = function(...options: Option[]) {
  for (const option of options) {
    const message = option.message || 'invalid_data'
    const realType = typeof option.data
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
        assert(realType === 'string', message)
        if (option.require === false && option.data === '') break
        if (option.maxLength) assert(option.data.length <= option.maxLength, message)
        if (option.minLength) assert(option.data.length >= option.minLength, message)
        if (option.regExp) assert(option.regExp.test(option.data), message)
        break
      case 'date':
        assert(option.data instanceof Date && !isNaN(option.data.getTime()), message)
        break
      case 'past':
        assert(option.data instanceof Date && !isNaN(option.data.getTime()) && option.data < new Date(), message)
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
    if (option.enums) {
      let flag = false
      for (const item of option.enums) {
        if (_.isEqual(option.data, item)) {
          flag = true
          break
        }
      }
      assert(flag, message)
    }
    if (option.min) {
      assert(option.min <= option.data, message)
    }
    if (option.max) {
      assert(option.max >= option.data, message)
    }
  }
}

export = assert
