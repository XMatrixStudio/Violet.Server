declare module 'captchapng2' {
  namespace Captchapng {}

  class Captchapng {
    constructor(width: number, height: number, dispNumber: number)

    getBase64(): string
  }

  export = Captchapng
}
