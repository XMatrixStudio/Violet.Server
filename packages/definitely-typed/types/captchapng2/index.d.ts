declare module 'captchapng2' {
  namespace CaptchaPng {}

  class CaptchaPng extends PngLib {
    constructor(width: number, height: number, displayNumber: number)
  }

  class PngLib {
    constructor(width: number, height: number, depth?: number, bgColor?: string | Array<number>)

    index(x: number, y: number): number
    color(rgba: string | Array<number>): number

    setBgColor(rgba: string | Array<number>): number
    setPixel(x: number, y: number, rgba: string | Array<number>): void

    getBase64(): string
    getBuffer(): Buffer

    deflate(): Buffer
  }

  export = CaptchaPng
}
