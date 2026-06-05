import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateBranchDto {
  @IsString()
  @MaxLength(200)
  branch!: string

  @IsString()
  @MaxLength(120)
  storeName!: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @IsInt()
  @Min(1)
  @IsOptional()
  progress?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  createTime?: number
}
