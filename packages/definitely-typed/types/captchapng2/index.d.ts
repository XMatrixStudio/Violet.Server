declare module 'captchapng2' {
  import * as PngLib from 'node-pnglib'

  namespace CaptchaPng {}

  class CaptchaPng extends PngLib {
    constructor(width: number, height: number, dispNumer: number)
  }

  export = CaptchaPng
}
