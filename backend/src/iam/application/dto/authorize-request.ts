import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class AuthorizeRequestDto {
  @IsString()
  @IsNotEmpty()
  state: string;

  // OpenID Connect ui_locales: space-separated language tags (e.g. "en" or "es-AR es").
  @IsOptional()
  @IsString()
  @MaxLength(35)
  @Matches(
    /^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*( [A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*)*$/,
  )
  uiLocales?: string;
}
