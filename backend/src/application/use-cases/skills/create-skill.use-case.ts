import { Injectable } from '@nestjs/common';
import { Skill } from '../../../domain/entities/skill.entity.js';
import { ConflictError } from '../../../domain/errors/domain.error.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';
import { CreateSkillDto } from '../../dtos/skills/create-skill.dto.js';
import { SkillHierarchyValidator } from './skill-hierarchy.validator.js';

@Injectable()
export class CreateSkillUseCase {
  constructor(
    private readonly skills: SkillRepository,
    private readonly hierarchy: SkillHierarchyValidator,
  ) {}

  async execute(dto: CreateSkillDto): Promise<Skill> {
    if (await this.skills.findByCode(dto.code)) {
      throw new ConflictError(`A skill with code "${dto.code}" already exists`);
    }
    const parentId = dto.parentId ?? null;
    if (parentId !== null) {
      await this.hierarchy.assertValidParent(parentId);
    }
    return this.skills.create({
      parentId,
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      active: dto.active ?? true,
    });
  }
}
