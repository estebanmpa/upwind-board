import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  EquipmentStatus,
  EquipmentType,
} from '../../../domain/entities/equipment.entity.js';
import { Trim } from '../common/transformers.js';

export class CreateEquipmentDto {
  /** @example Rebel 9 #2 */
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: EquipmentType, enumName: 'EquipmentType' })
  @IsEnum(EquipmentType)
  type: EquipmentType;

  /** @example Duotone */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  brand?: string | null;

  /** @example Rebel SLS */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  model?: string | null;

  /** Free text. @example 9 m² */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(50)
  size?: string | null;

  /** Unique when provided. */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  serialNumber?: string | null;

  /** Defaults to available. */
  @ApiProperty({
    enum: EquipmentStatus,
    enumName: 'EquipmentStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @IsOptional()
  @Trim()
  @IsString()
  notes?: string | null;
}
