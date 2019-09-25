import { Injectable, NotImplementedException } from '@nestjs/common'

@Injectable()
export class UtilService {
  createCaptcha(session: Express.Session): string {
    throw new NotImplementedException()
  }

  verifyCaptcha(session: Express.Session): boolean {
    throw new NotImplementedException()
  }
}
