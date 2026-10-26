import { Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationError,
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';

/** Rules shared by create and update when a skill gets a (new) parent. */
@Injectable()
export class SkillHierarchyValidator {
  constructor(private readonly skills: SkillRepository) {}

  /**
   * @param skillId the skill being moved; undefined when creating a new one.
   */
  async assertValidParent(parentId: string, skillId?: string): Promise<void> {
    const parent = await this.skills.findById(parentId);
    if (!parent) throw new NotFoundError('Parent skill', parentId);

    if (skillId !== undefined) {
      // The skill cannot hang from itself or from any of its descendants,
      // i.e. it must not appear among the new parent's ancestors.
      const ancestors = await this.skills.findAncestorIds(parentId);
      if (ancestors.includes(skillId)) {
        throw new BusinessRuleViolationError(
          'A skill cannot be moved under itself or one of its descendants',
        );
      }
    }

    // Records only live on leaves: a skill that has already been evaluated
    // cannot become a grouping node.
    if (await this.skills.isUsedInRecords(parentId)) {
      throw new ConflictError(
        `Skill "${parent.code}" already has lesson records and cannot have children`,
      );
    }
  }
}
