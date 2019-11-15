import { Matches, IsString, IsHash, IsIn, IsEmail } from 'class-validator'
import { IRegisterUserRequest, ISendEmailToUserRequest } from '../../../packages/violet-api'

export class RegisterRequest implements IRegisterUserRequest {
  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/)
  readonly name!: string

  @IsHash('sha512')
  readonly password!: string

  @IsString()
  readonly nickname!: string
}

export class SendEmailRequest implements ISendEmailToUserRequest {
  @IsIn(['register', 'reset', 'update'])
  readonly type!: 'register' | 'reset' | 'update'

  @IsString()
  readonly captcha!: string

  @IsEmail()
  readonly email!: string
}
