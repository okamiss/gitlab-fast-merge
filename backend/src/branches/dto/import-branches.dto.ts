import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { CreateBranchDto } from './create-branch.dto'

export class ImportBranchesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBranchDto)
  records!: CreateBranchDto[]
}
