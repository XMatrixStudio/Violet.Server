/**
 * Http Response
 */
export type THttpResponse<SuccessType, ErrorType> = SuccessType | ErrorType

/**
 * Http Success Response
 */
export type THttp200Response = 'OK'
export type THttp201Response = 'Created'
export type THttp204Response = 'No Content'

/**
 * Http Error Response
 */
export interface IErrorResponse {
  debug?: {
    error: {
      stack?: string
    }
  }
  error: string
}
