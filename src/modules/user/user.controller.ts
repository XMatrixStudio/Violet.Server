import { Body, Controller, Post } from '@nestjs/common'

import { RegisterRequest } from './user.request'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(@Body() body: RegisterRequest) {
    await this.userService.register()
  }
}
