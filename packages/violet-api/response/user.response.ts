import { IErrorResponse, THttp201Response, THttpResponse } from './http.response'

export type TRegisterUserResponse = THttpResponse<THttp201Response, IErrorResponse>
