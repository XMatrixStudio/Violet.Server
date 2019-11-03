import { Module } from '@nestjs/common'
import { UserModule } from './modules/user/user.module'
import { UtilModule } from './modules/util/util.module'
import { TypeOrmModule } from '@nestjs/typeorm'

import { DBConfig } from './app.config'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DBConfig.host,
      port: DBConfig.port,
      username: DBConfig.user,
      password: DBConfig.password,
      database: DBConfig.user,
      entities: [],
      synchronize: true,
    }),
    UserModule,
    UtilModule,
  ],
})
export class AppModule {}
