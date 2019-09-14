import { Module } from '@nestjs/common'
import { UtilController } from './util.controller'

@Module({
  controllers: [UtilController],
})
export class UtilModule {}
