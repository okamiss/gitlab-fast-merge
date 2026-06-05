import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthUser } from '../common/types/auth-user'
import { BranchesService } from './branches.service'
import { BranchTrendQueryDto } from './dto/branch-trend-query.dto'
import { CreateBranchDto } from './dto/create-branch.dto'
import { ImportBranchesDto } from './dto/import-branches.dto'
import { ListBranchesQueryDto } from './dto/list-branches-query.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'

@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get('trend')
  trend(@CurrentUser() user: AuthUser, @Query() query: BranchTrendQueryDto) {
    return this.branches.trend(user.userId, query.year)
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListBranchesQueryDto) {
    return this.branches.list(user.userId, query.page, query.pageSize)
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBranchDto) {
    return this.branches.create(user.userId, dto)
  }

  @Post('import')
  importLegacy(@CurrentUser() user: AuthUser, @Body() dto: ImportBranchesDto) {
    return this.branches.importLegacy(user.userId, dto.records)
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branches.update(user.userId, id, dto)
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.branches.remove(user.userId, id)
  }
}
