import { Injectable } from '@nestjs/common';
import { Skill } from '../../../domain/entities/skill.entity.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';
import { UpdateSkillDto } from '../../dtos/skills/update-skill.dto.js';
import { SkillHierarchyValidator } from './skill-hierarchy.validator.js';

@Injectable()
export class UpdateSkillUseCase {
  constructor(
    private readonly skills: SkillRepository,
    private readonly hierarchy: SkillHierarchyValidator,
  ) {}

  async execute(id: string, dto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.skills.findById(id);
    if (!skill) throw new NotFoundError('Skill', id);

    if (dto.code !== undefined && dto.code !== skill.code) {
      const sameCode = await this.skills.findByCode(dto.code);
      if (sameCode && sameCode.id !== id) {
        throw new ConflictError(
          `A skill with code "${dto.code}" already exists`,
        );
      }
    }

    if (
      dto.parentId !== undefined &&
      dto.parentId !== null &&
      dto.parentId !== skill.parentId
    ) {
      await this.hierarchy.assertValidParent(dto.parentId, id);
    }

    return this.skills.update(id, {
      parentId: dto.parentId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      sortOrder: dto.sortOrder,
      active: dto.active,
    });
  }
}
