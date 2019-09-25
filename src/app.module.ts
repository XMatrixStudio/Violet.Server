import { Module } from '@nestjs/common'

import { UserModule } from './modules/user/user.module'
import { UtilModule } from './modules/util/util.module'

@Module({
  imports: [UserModule, UtilModule],
})
export class AppModule {}
