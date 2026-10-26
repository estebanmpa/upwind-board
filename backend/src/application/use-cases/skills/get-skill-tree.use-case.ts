import { Injectable } from '@nestjs/common';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';
import { SkillTreeNodeDto } from '../../dtos/skills/skill-tree-node.dto.js';
import { buildSkillTree } from '../../services/skill-tree.builder.js';

@Injectable()
export class GetSkillTreeUseCase {
  constructor(private readonly skills: SkillRepository) {}

  async execute(options: {
    includeInactive: boolean;
  }): Promise<SkillTreeNodeDto[]> {
    return buildSkillTree(await this.skills.findTree(options));
  }
}
