import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class BranchTrendQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  year?: number
}
