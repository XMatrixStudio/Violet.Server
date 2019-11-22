import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as crypto from 'crypto'
import { Repository } from 'typeorm'
import { Passport } from './passport.entity'

@Injectable()
export class PassportService {
  constructor(@InjectRepository(Passport) private readonly passportRepo: Repository<Passport>) {}

  async createPassport(userId: number, password: string) {
    const hash = this.hashPassword(password)
    this.passportRepo.create({ id: userId, password: hash.password, passwordSalt: hash.salt })
  }

  private hashPassword(password: string, salt: string = this.randomSalt(64)): Record<'password' | 'salt', string> {
    password = this.hashString(this.hashString(password) + salt)
    return { password: password, salt: salt }
  }

  private hashString(str: string): string {
    const sha512 = crypto.createHash('sha512')
    return sha512.update(str).digest('hex')
  }

  private randomSalt(length: number): string {
    return crypto
      .randomBytes((length + 1) / 2)
      .toString('hex')
      .substring(0, length)
  }
}
