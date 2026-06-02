import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @IsInt()
  @IsIn([1, 2, 3, 4])
  @IsOptional()
  progress?: number
}
