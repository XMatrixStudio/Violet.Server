import { Injectable } from '@nestjs/common'

@Injectable()
export class UserService {
  async register() {
    // tslint:disable-next-line: no-console
    console.log('hello, register')
  }
}
