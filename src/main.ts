import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as program from 'commander'
import * as session from 'express-session'
import { AppModule } from './app.module'
import { validationErrorFactory } from './errors/validation.error'
import { HttpExceptionFilter } from './filters/error.filter'
import { ConfigService } from './modules/config/config.service'

async function init() {
  program
    .version('3.0-alpha', '-v, --version')
    .option('-c, --config <file>', 'specify configuration file', 'config.yaml')
    .parse(process.argv)
  ConfigService.init(program.config as string)
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
  await app.listen(ConfigService.getAppConfig().port)
}

void init()
  .then(() => {
    void bootstrap()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log(`Listen at ${ConfigService.getAppConfig().port}`)
      })
      .catch(reason => {
        // eslint-disable-next-line no-console
        console.log('Listen failed', reason)
      })
  })
  .catch(reason => {
    // eslint-disable-next-line no-console
    console.error('Init failed', reason)
  })
