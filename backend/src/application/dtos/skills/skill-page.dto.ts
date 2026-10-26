import { ApiProperty } from '@nestjs/swagger';
import { Skill } from '../../../domain/entities/skill.entity.js';

export class SkillPageDto {
  @ApiProperty({ type: () => [Skill] })
  items: Skill[];
  total: number;
  page: number;
  limit: number;
}
