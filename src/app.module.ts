import { Module } from '@nestjs/common'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigModule } from './modules/config/config.module'
import { ConfigService } from './modules/config/config.service'
import { UserModule } from './modules/user/user.module'
import { UtilModule } from './modules/util/util.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const dbConfig = configService.getDBConfig()
        return {
          type: 'mysql',
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.dbname,
          username: dbConfig.user,
          password: dbConfig.password,
          entities: [`${__dirname}/**/*.entity.ts`],
          synchronize: false,
        }
      },
    }),
    UserModule,
    UtilModule,
  ],
})
export class AppModule {}
