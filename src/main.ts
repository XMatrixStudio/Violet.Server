import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const DEFAULT_APP_PORT = 30001
const APP_PORT = process.env.APP_PORT || DEFAULT_APP_PORT

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(APP_PORT)
}
void bootstrap().then(() => {
  // tslint:disable-next-line: no-console
  console.log(`Listen at ${APP_PORT}`)
})
