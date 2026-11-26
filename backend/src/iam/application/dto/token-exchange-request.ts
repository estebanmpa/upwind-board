import { IsNotEmpty, IsString } from 'class-validator';

/** Authorization code the frontend received on its callback page. */
export class TokenExchangeRequestDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
