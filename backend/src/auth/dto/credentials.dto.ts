import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class CredentialsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: '用户名只能包含字母、数字、下划线和短横线' })
  username!: string

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string
}
