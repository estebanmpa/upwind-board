import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Trim, TrimLowerCase } from '../common/transformers.js';

export class CreateInstructorDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  /** Unique; stored lowercased. */
  @TrimLowerCase()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone: string;

  /** IKO instructor number, if certified. */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  ikoInstructorId?: string | null;

  /** Defaults to true. */
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
