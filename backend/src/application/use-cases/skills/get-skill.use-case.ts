import { Injectable } from '@nestjs/common';
import { Skill } from '../../../domain/entities/skill.entity.js';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';

@Injectable()
export class GetSkillUseCase {
  constructor(private readonly skills: SkillRepository) {}

  async execute(id: string): Promise<Skill> {
    const skill = await this.skills.findById(id);
    if (!skill) throw new NotFoundError('Skill', id);
    return skill;
  }
}
