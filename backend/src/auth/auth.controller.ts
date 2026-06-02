import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthUser } from '../common/types/auth-user'
import { AuthService } from './auth.service'
import { CredentialsDto } from './dto/credentials.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() credentials: CredentialsDto) {
    return this.auth.register(credentials)
  }

  @Post('login')
  login(@Body() credentials: CredentialsDto) {
    return this.auth.login(credentials)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return { id: user.userId, username: user.username }
  }
}
