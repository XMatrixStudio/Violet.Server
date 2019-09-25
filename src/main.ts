import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as session from 'express-session'

import { AppModule } from './app.module'
import { validationErrorFactory } from './errors/validation.error'
import { HttpExceptionFilter } from './filters/error.filter'

const DEFAULT_APP_PORT = 30001
const APP_PORT = process.env.APP_PORT || DEFAULT_APP_PORT

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      exceptionFactory: validationErrorFactory,
    }),
  )
  app.use(session({ secret: 'xmatrix-studio-violet' }))
  await app.listen(APP_PORT)
}

void bootstrap().then(() => {
  // tslint:disable-next-line: no-console
  console.log(`Listen at ${APP_PORT}`)
})
