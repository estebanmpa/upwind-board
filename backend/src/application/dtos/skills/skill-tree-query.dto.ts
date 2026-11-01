import { IsBoolean, IsOptional } from 'class-validator';
import { ToBoolean } from '../common/transformers.js';

export class SkillTreeQueryDto {
  /** Include inactive skills (and their subtrees). Defaults to false. */
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  includeInactive?: boolean;
}
