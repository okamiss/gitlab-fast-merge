import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator'

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
}
