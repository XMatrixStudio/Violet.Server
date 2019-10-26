import { Injectable, NotImplementedException } from '@nestjs/common'

@Injectable()
export class UserService {
  // tslint:disable-next-line: no-async-without-await
  async register() {
    throw new NotImplementedException()
  }
}
