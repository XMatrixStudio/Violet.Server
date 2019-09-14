import { IsString, Matches } from 'class-validator'

import { IRegisterUserRequest } from '../../../packages/violet-api'

export class RegisterRequest implements IRegisterUserRequest {
  readonly code!: string

  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/)
  readonly name!: string

  readonly password!: string
}
