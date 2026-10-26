import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto.js';

/** parentId: null moves the skill to the root; omitting it keeps the parent. */
export class UpdateSkillDto extends PartialType(CreateSkillDto) {}
