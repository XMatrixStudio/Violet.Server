import { IRegisterUserRequest } from '../../../packages/violet-api'

export class RegisterRequest implements IRegisterUserRequest {
  readonly code!: string
  readonly name!: string
  readonly password!: string
}
