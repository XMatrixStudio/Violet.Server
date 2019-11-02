import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as program from 'commander'
import * as session from 'express-session'
import { AppConfig, initConfig } from './app.config'
import { AppModule } from './app.module'
import { validationErrorFactory } from './errors/validation.error'
import { HttpExceptionFilter } from './filters/error.filter'

async function init() {
  program
    .version('3.0-alpha', '-v, --version')
    .option('-c, --config <file>', 'specify configuration file', 'config.yaml')
    .parse(process.argv)
  initConfig(program.config as string)
  return
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      exceptionFactory: validationErrorFactory,
    }),
  )
  app.use(session({ secret: 'xm.violet.sid' }))
  await app.listen(AppConfig.port)
}

void init()
  .then(() => {
    void bootstrap().then(() => {
      // tslint:disable-next-line: no-console
      console.log(`Listen at ${AppConfig.port}`)
    })
  })
  .catch(reason => {
    // tslint:disable-next-line: no-console
    console.error('Init failed', reason)
  })
