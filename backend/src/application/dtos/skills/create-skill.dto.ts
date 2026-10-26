import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim, TrimUpperCase } from '../common/transformers.js';

export class CreateSkillDto {
  /** Parent skill; omit or send null to create a root node (an IKO level). */
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  /** Unique code, uppercase words separated by dashes. @example L1-WIND-WINDOW */
  @TrimUpperCase()
  @IsString()
  @Matches(/^[A-Z0-9]+(-[A-Z0-9]+)*$/, {
    message: 'code must be uppercase alphanumeric words separated by dashes',
  })
  @MaxLength(100)
  code: string;

  /** @example Ventana de viento */
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @Trim()
  @IsString()
  description?: string | null;

  /** Position among its siblings (ascending). Defaults to 0. */
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  /** Defaults to true. */
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
