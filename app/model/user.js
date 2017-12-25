const db = require('../../lib/mongo')
const userSchema = db.Schema({
  email: String,
  name: String,
  nikeName: String,
  password: String,
  salt: String,
  valid: {
    type: Boolean,
    default: false
  },
  exp: Number,
  userClass: {
    type: Number,
    default: 0
  },
  detail: {
    web: String,
    phone: Number,
    info: String,
    sex: Number,
    birthDate: Date,
    location: String,
    avatar: String,
    showPhone: Boolean,
    showDate: Boolean
  },
  emailCode: {
    type: Number,
    default: 0
  },
  emailTime: {
    type: Date,
    default: new Date('2000-1-1')
  },
  createTime: {
    type: Date,
    default: new Date()
  },
  auth: [{
    clientId: String, // db.Schema.Types.ObjectId,
    achievement: [String]
  }]
}, {
  collection: 'users'
})
const UserDB = db.model('users', userSchema)

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

exports.getAuthList = async userId => {
  try {
    let user = await UserDB.findById(userId).select('auth')
    return user.auth
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

/* async function test() {
  let result = await exports.getAuthList('5a195ef4d45fb82cf00929d1', 'kkka')
  console.log(result)
}
test() */
