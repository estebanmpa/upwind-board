import { Injectable } from '@nestjs/common';
import {
  ConflictError,
  NotFoundError,
} from '../../../domain/errors/domain.error.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';

@Injectable()
export class DeleteSkillUseCase {
  constructor(private readonly skills: SkillRepository) {}

  async execute(id: string): Promise<void> {
    const skill = await this.skills.findById(id);
    if (!skill) throw new NotFoundError('Skill', id);

    if ((await this.skills.findIdsWithChildren([id])).length > 0) {
      throw new ConflictError(
        `Skill "${skill.code}" has children; delete or move them first`,
      );
    }
    if (await this.skills.isUsedInRecords(id)) {
      throw new ConflictError(
        `Skill "${skill.code}" has lesson records; deactivate it instead`,
      );
    }
    await this.skills.delete(id);
  }
}
