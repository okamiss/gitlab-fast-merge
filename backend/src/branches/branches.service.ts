import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { normalizeRepositories } from '../settings/default-repositories'
import { CreateBranchDto } from './dto/create-branch.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'
import { normalizeBranchPage } from './pagination'

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async trend(userId: string, year?: number | string) {
    const records = await this.prisma.branchRecord.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    const years = Array.from(new Set(records.map((record) => record.createdAt.getFullYear()))).sort((a, b) => b - a)
    const requestedYear = typeof year === 'string' ? Number(year) : year
    const selectedYear =
      typeof requestedYear === 'number' && years.includes(requestedYear) ? requestedYear : years[0]
    const months = Array.from({ length: 12 }, (_, index) => ({ month: index + 1, count: 0 }))

    if (selectedYear) {
      for (const record of records) {
        const createdAt = record.createdAt
        if (createdAt.getFullYear() === selectedYear) {
          months[createdAt.getMonth()].count += 1
        }
      }
    }

    return { years, selectedYear, months }
  }

  async list(userId: string, page?: number | string, pageSize?: number | string) {
    const pagination = normalizeBranchPage(page, pageSize)
    const where = { userId }
    const [total, data] = await this.prisma.$transaction([
      this.prisma.branchRecord.count({ where }),
      this.prisma.branchRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.pageSize
      })
    ])

    return {
      data,
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize)
      }
    }
  }

  async create(userId: string, dto: CreateBranchDto) {
    await this.ensureRepositoryAvailable(userId, dto.storeName)
    try {
      return await this.prisma.branchRecord.create({
        data: {
          userId,
          branch: dto.branch.trim(),
          storeName: dto.storeName,
          description: dto.description?.trim() ?? '',
          progress: dto.progress ?? 1,
          createdAt: dto.createTime ? new Date(dto.createTime * 1000) : undefined
        }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('该仓库中已保存同名 Branch')
      }
      throw error
    }
  }

  async update(userId: string, id: string, dto: UpdateBranchDto) {
    await this.ensureOwned(userId, id)
    return this.prisma.branchRecord.update({
      where: { id },
      data: {
        description: dto.description?.trim(),
        progress: dto.progress
      }
    })
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id)
    await this.prisma.branchRecord.delete({ where: { id } })
    return { deleted: true }
  }

  async importLegacy(userId: string, records: CreateBranchDto[]) {
    await this.ensureRepositoriesAvailable(userId, records.map((record) => record.storeName))
    await this.prisma.branchRecord.createMany({
      data: records.map((record) => ({
        userId,
        branch: record.branch.trim(),
        storeName: record.storeName,
        description: record.description?.trim() ?? '',
        progress: record.progress ?? 1,
        createdAt: record.createTime ? new Date(record.createTime * 1000) : new Date()
      })),
      skipDuplicates: true
    })
    return this.list(userId)
  }

  private async ensureOwned(userId: string, id: string) {
    const branch = await this.prisma.branchRecord.findFirst({ where: { id, userId } })
    if (!branch) {
      throw new NotFoundException('Branch 记录不存在')
    }
  }

  private async ensureRepositoryAvailable(userId: string, storeName: string) {
    await this.ensureRepositoriesAvailable(userId, [storeName])
  }

  private async ensureRepositoriesAvailable(userId: string, storeNames: string[]) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {}
    })
    const repositories = normalizeRepositories(settings.repositories)
    const allowedStoreNames = new Set(repositories.map((repository) => repository.value))
    const invalidStoreName = storeNames.find((storeName) => !allowedStoreNames.has(storeName))

    if (invalidStoreName) {
      throw new BadRequestException('代码仓库不存在，请先在工作台设置中添加')
    }
  }
}
