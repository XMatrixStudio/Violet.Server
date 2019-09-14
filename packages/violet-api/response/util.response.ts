import { THttpResponse, IErrorResponse } from './http.response'

export interface IGetCaptchaSuccessResponse {
  captcha: string
}

export type TGetCaptchaResponse = THttpResponse<IGetCaptchaSuccessResponse, IErrorResponse>
