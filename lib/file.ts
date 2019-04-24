import COS = require('cos-nodejs-sdk-v5')

import config from '../app/config/config'

const cos = new COS({
  SecretId: config!.file.cos.secretId,
  SecretKey: config!.file.cos.secretKey,
  Bucket: config!.file.cos.bucket,
  Region: config!.file.cos.region,
  Url: config!.file.cos.url
})

export async function upload(name: string, file: Buffer): Promise<void> {
  const params = {
    Bucket: config!.file.cos.bucket,
    Region: config!.file.cos.region,
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
