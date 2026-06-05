import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
  ValidateNested
} from 'class-validator'

class RepositoryOptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  id!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  value!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  label!: string
}

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  defaultPrefix?: string

  @IsUrl({ require_tld: false }, { message: 'GitLab 域名必须是完整 URL' })
  @ValidateIf((_object, value: string) => value !== '')
  @IsOptional()
  @MaxLength(300)
  domainUrl?: string

  @IsString()
  @IsOptional()
  @MaxLength(200)
  groupName?: string

  @IsBoolean()
  @IsOptional()
  darkTheme?: boolean

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepositoryOptionDto)
  @IsOptional()
  repositories?: RepositoryOptionDto[]
}
