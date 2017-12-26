const db = require('../../lib/mongo')
const userSchema = db.Schema({
  email: String, // 主邮箱, 无大写
  name: String, // 用户名, 无大写
  nikeName: String, // 昵称, 原始数据
  class: Number, // 用户类型
  createTime: {
    type: Date,
    default: new Date()
  },
  secure: {
    password: String,
    salt: String,
    valid: {
      type: Boolean,
      default: false
    },
    emailCode: {
      type: Number,
      default: 0
    },
    emailTime: {
      type: Date,
      default: new Date('2000-1-1')
    },
    autoLogin: Boolean
  },
  info: {
    publicEmail: String,
    email: [String],
    bio: String,
    url: String,
    phone: String,
    gender: Number,
    birthDate: Date,
    location: String,
    avatar: String,
    show: {
      phone: Boolean,
      gender: Boolean,
      birth: Boolean
    }
  },
  auth: [{
    clientId: String, // db.Schema.Types.ObjectId
    achievement: [String]
  }],
  manage: [{
    clientId: String // db.Schema.Types.ObjectId
  }]
}, {
  collection: 'users'
})
const UserDB = db.model('users', userSchema)

/**
 * 获得成就
 *
 * @param {String} userId 用户Id
 * @param {String} clientId 授权客户端Id
 * @param {String} achievementId 成就Id
 */
exports.addAchievement = async (userId, clientId, achievementId) => {
  try {
    let result = await UserDB.update({
      _id: userId,
      'auth.clientId': clientId
    }, {
      $addToSet: {
        'auth.$.achievement': achievementId
      }
    })
    return result.nModified === 1
  } catch (error) {
    return false
  }
}

/**
 * 添加授权
 *
 * @param {String} userId 用户Id
 * @param {String} clientId 授权客户端Id
 */
exports.addAuth = async (userId, clientId) => {
  try {
    let result = await UserDB.update({
      _id: userId,
      'auth.clientId': {
        $ne: clientId
      }
    }, {
      $push: {
        auth: {
          clientId: clientId
        }
      }
    })
    return {
      isNew: result.nModified === 1
    }
  } catch (error) {
    return false
  }
}

/**
 * 删除授权
 *
 * @param {String} userId 用户Id
 * @param {String} clientId 授权客户端Id
 */
exports.deleteAuth = async (userId, clientId) => {
  try {
    let result = await UserDB.update({
      _id: userId,
      'auth.clientId': clientId
    }, {
      $pull: {
        auth: {
          clientId: clientId
        }
      }
    })
    return result.nModified === 1
  } catch (error) {
    return false
  }
}

/**
 * 获取授权列表
 *
 * @param {String} userId 用户Id
 */
exports.getAuthList = async userId => {
  try {
    let user = await UserDB.findById(userId).select('auth')
    return user.auth
  } catch (error) {
    return false
  }
}

/**
 * 设置用户个人简介信息
 *
 * @param {String} userId 用户Id
 * @param {Object} data
 */
exports.setInfoById = async (userId, data) => {
  try {
    let newData = {}
    let names = ['publicEmail', 'email', 'bio', 'url', 'phone', 'gender', 'birthDate', 'location', 'avatar']
    for (let name of names) {
      if (data[name]) newData[name] = data[name]
    }
    if (data.show) {
      newData.show = {}
      let names = ['phone', 'gender', 'birth']
      for (let name of names) {
        if (data.show[name]) newData.show[name] = data.show[name]
      }
    }
    await UserDB.update({
      _id: userId
    }, {
      $set: {
        info: newData
      }
    })
    return true
  } catch (error) {
    return false
  }
}

exports.setById = async (userId, data) => {
  try {
    let newData = {}
    let names = ['email', 'name', 'nikeName', 'password', 'salt', 'valid', 'exp', 'userClass', 'emailCode', 'emailTime']
    for (let name of names) {
      if (data[name]) newData[name] = data[name]
    }
    if (data.detail) {
      newData.detail = {}
      let names = ['web', 'phone', 'info', 'sex', 'birthDate', 'location', 'avatar', 'showPhone', 'showDate']
      for (let name of names) {
        if (data.detail[name]) newData.detail[name] = data.detail[name]
      }
    }
    await UserDB.update({
      _id: userId
    }, {
      $set: newData
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 创建空用户
 */
exports.add = async () => {
  try {
    let user = await UserDB.create({})
    return user.id
  } catch (error) {
    return false
  }
}

exports.getById = async userId => {
  try {
    let user = await UserDB.findById(userId)
    return user
  } catch (error) {
    return false
  }
}

exports.getByName = async userName => {
  try {
    let user = await UserDB.findOne({
      name: userName
    })
    return user
  } catch (error) {
    return false
  }
}

exports.getByEmail = async userEmail => {
  try {
    let user = await UserDB.findOne({
      email: userEmail
    })
    return user
  } catch (error) {
    return false
  }
}

exports.validByEmail = async userEmail => {
  let user = await exports.getByEmail(userEmail)
  if (!user) return false
  user.valid = true
  await user.save()
  return true
}

exports.setPasswordByEmail = async (userEmail, password, userSalt) => {
  let user = await exports.getByEmail(userEmail)
  if (!user) return false
  user.password = password
  user.salt = userSalt
  await user.save()
  return true
}

async function test () {
  let result = await exports.setInfoById('5a4104318a51da3ab0ebea61', {
    publicEmail: 'zhenlychen@foxmail.com',
    bio: 'I\'m dalao~',
    gender: 2,
    show: {
      phone: false,
      gender: true,
      birth: false
    }
  })
  console.log(result)
}
test()
