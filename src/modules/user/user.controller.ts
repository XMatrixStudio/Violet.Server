import { Controller, Get } from '@nestjs/common'

@Controller('users')
export class UserController {
  @Get()
  public async getUsers(): Promise<string> {
    return 'hello, world'
  }
}
