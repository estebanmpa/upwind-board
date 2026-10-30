import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { Trim, TrimLowerCase } from '../common/transformers.js';

export class CreateStudentDto {
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

  @TrimLowerCase()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  /** ISO date. @example 1995-04-21 */
  @IsOptional()
  @IsDateString({ strict: true })
  birthDate?: string | null;

  /** @example 72.5 */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(999)
  weightKg?: number | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(200)
  emergencyContactName?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  emergencyContactPhone?: string | null;

  @IsOptional()
  @Trim()
  @IsString()
  notes?: string | null;
}
