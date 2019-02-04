declare module 'cos-nodejs-sdk-v5' {
  interface Config {
    SecretId: string
    SecretKey: string
    Bucket: string
    Region: string
    Url: string
  }

  interface Params {
    Bucket: string
    Region: string
    Key: string
    ContentLength: number
    ContentDisposition: string
    ContentType: string
    Body: Buffer
  }

  export class COS {
    constructor(config: Config)

    putObject(params: Params, callback: (err: Error, data: any) => void): void
  }
}
