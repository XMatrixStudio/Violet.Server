export interface IRegisterUserRequest {
  name: string
  password: string
  nickname: string
}

export interface ISendEmailToUserRequest {
  type: 'register' | 'reset' | 'update'
  captcha: string
  email: string
}
