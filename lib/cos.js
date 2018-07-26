const cosConfig = require('../config/cos')
const COS = require('cos-nodejs-sdk-v5')
const cos = new COS(cosConfig)

exports.upload = async (name, file) => {
  let params = {
    Bucket: cosConfig.Bucket,
    Region: cosConfig.Region,
    Key: name,
    ContentLength: file.length,
    ContentDisposition: name,
    ContentType: 'image/png',
    Body: file
  }
  return new Promise((resolve, reject) => {
    cos.putObject(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
