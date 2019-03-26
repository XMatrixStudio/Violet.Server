import COS = require('cos-nodejs-sdk-v5')

import * as config from '../app/config/config'

// const cos = new COS({
//   SecretId: config.avatar.cos.secretId,
//   SecretKey: config.avatar.cos.secretKey,
//   Bucket: config.avatar.cos.bucket,
//   Region: config.avatar.cos.region,
//   Url: config.avatar.cos.url
// })

export async function upload(name: string, file: Buffer): Promise<void> {
  const params = {
    // Bucket: config.avatar.cos.bucket,
    // Region: config.avatar.cos.region,
    // Key: name,
    // ContentLength: file.length,
    // ContentDisposition: name,
    // ContentType: 'image/png',
    // Body: file
  }
  return new Promise((resolve, reject) => {
    // cos.putObject(params, (err, data) => {
    //   if (err) {
    //     reject(err)
    //   } else {
    //     resolve(data)
    //   }
    // })
  })
}
