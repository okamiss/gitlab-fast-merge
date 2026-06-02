import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

const storeNames = [
  'admin-crm',
  'admin-scrm',
  'web-wwside',
  'admin-promotion',
  'admin-videolive',
  'admin-app',
  'web-official',
  'admin-cms',
  'web-course',
  'admin-sso'
]

export class CreateBranchDto {
  @IsString()
  @MaxLength(200)
  branch!: string

  @IsString()
  @IsIn(storeNames)
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
