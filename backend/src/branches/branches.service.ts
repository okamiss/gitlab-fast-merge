import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBranchDto } from './dto/create-branch.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.branchRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async create(userId: string, dto: CreateBranchDto) {
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
}
