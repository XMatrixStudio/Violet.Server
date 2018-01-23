const db = require('../../lib/mongo')
const userSchema = db.Schema({
  email: String, // 主邮箱, 无大写
  name: String, // 用户名, 无大写
  nikeName: String, // 昵称, 原始数据
  userClass: {
    type: Number, // 用户类型
    default: 0
  },
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
    autoLogin: Boolean,
    errorTime: Date,
    errorCount: Number
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
      phone: {
        type: Boolean,
        default: true
      },
      birthDate: {
        type: Boolean,
        default: true
      },
      location: {
        type: Boolean,
        default: true
      }
    }
  },
  auth: [{
    clientId: String, // db.Schema.Types.ObjectId
    time: Date
  }]
}, {
  collection: 'users'
})
const UserDB = db.model('users', userSchema)

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
 * @param {Object} data 用户个人简介信息
 */
exports.setInfoById = async (userId, data) => {
  try {
    let user = await exports.getById(userId)
    let names = ['publicEmail', 'email', 'bio', 'url', 'phone', 'gender', 'birthDate', 'location', 'avatar']
    for (let name of names) {
      if (data[name]) user.info[name] = data[name]
    }
    if (data.show) {
      let names = ['phone', 'gender', 'birth']
      for (let name of names) {
        if (data.show[name]) user.info.show[name] = data.show[name]
      }
    }
    await user.save(() => { })
    return true
  } catch (error) {
    return false
  }
}

exports.setById = async (userId, data) => {
  try {
    let user = await exports.getById(userId)
    let names = ['email', 'name', 'nikeName', 'userClass', 'createTime']
    for (let name of names) {
      if (data[name]) user[name] = data[name]
    }
    if (data.secure) {
      let names = ['password', 'salt', 'valid', 'emailCode', 'emailTime', 'autoLogin']
      for (let name of names) {
        if (data.secure[name]) user.secure[name] = data.secure[name]
      }
    }
    await user.save(() => { })
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
      name: userName.toString().toLowerCase()
    })
    return user
  } catch (error) {
    return false
  }
}

exports.getByEmail = async userEmail => {
  try {
    let user = await UserDB.findOne({
      email: userEmail.toString().toLowerCase()
    })
    return user
  } catch (error) {
    return false
  }
}

exports.validByEmail = async userEmail => {
  let user = await exports.getByEmail(userEmail)
  if (!user) return false
  user.secure.valid = true
  await user.save()
  return true
}

exports.setPasswordByEmail = async (userEmail, password, userSalt) => {
  let user = await exports.getByEmail(userEmail)
  if (!user) return false
  user.secure.password = password
  user.secure.salt = userSalt
  await user.save()
  return true
}

exports.addError = async (userId) => {
  let user = await exports.getById(userId)
  if (user.secure.errorTime && new Date().getTime() - user.secure.errorTime.getTime() > 1000 * 60 * 60) {
    user.secure.errorTime = new Date()
  }
  user.secure.errorCount = user.secure.errorCount || 0
  user.secure.errorCount++
  user.save(() => { })
}
