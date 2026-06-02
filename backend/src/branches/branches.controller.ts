import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthUser } from '../common/types/auth-user'
import { BranchesService } from './branches.service'
import { CreateBranchDto } from './dto/create-branch.dto'
import { ImportBranchesDto } from './dto/import-branches.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'

@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.branches.list(user.userId)
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
