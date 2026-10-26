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

  @IsOptional()
  @TrimLowerCase()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone: string;

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

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  emergencyContactName: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  emergencyContactPhone: string;

  @IsOptional()
  @Trim()
  @IsString()
  notes?: string | null;
}
