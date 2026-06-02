import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CredentialsDto } from './dto/credentials.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(credentials: CredentialsDto) {
    const username = credentials.username.trim()
    const existing = await this.prisma.user.findUnique({ where: { username } })
    if (existing) {
      throw new ConflictException('用户名已存在')
    }
    const passwordHash = await bcrypt.hash(credentials.password, 12)
    const user = await this.prisma.user.create({
      data: { username, passwordHash, settings: { create: {} } }
    })
    return this.issueToken(user.id, user.username)
  }

  async login(credentials: CredentialsDto) {
    const user = await this.prisma.user.findUnique({ where: { username: credentials.username.trim() } })
    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new UnauthorizedException('用户名或密码错误')
    }
    return this.issueToken(user.id, user.username)
  }

  private async issueToken(id: string, username: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: id, username },
      { expiresIn: this.config.get('JWT_EXPIRES_IN', '7d') }
    )
    return { accessToken, user: { id, username } }
  }
}
