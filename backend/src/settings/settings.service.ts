import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { defaultRepositories, normalizeRepositories } from './default-repositories'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private toJson(repositories: ReturnType<typeof normalizeRepositories>) {
    return repositories as unknown as Prisma.InputJsonValue
  }

  get(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, repositories: this.toJson(defaultRepositories) },
      update: {}
    }).then((settings) => ({
      ...settings,
      repositories: normalizeRepositories(settings.repositories)
    }))
  }

  update(userId: string, dto: UpdateSettingsDto) {
    const { repositories, ...rest } = dto
    const normalizedRepositories =
      repositories === undefined ? undefined : normalizeRepositories(repositories)
    const data = {
      ...rest,
      ...(normalizedRepositories === undefined
        ? {}
        : { repositories: this.toJson(normalizedRepositories) })
    }
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...rest,
        repositories: this.toJson(normalizedRepositories ?? defaultRepositories)
      },
      update: data
    }).then((settings) => ({
      ...settings,
      repositories: normalizeRepositories(settings.repositories)
    }))
  }
}
