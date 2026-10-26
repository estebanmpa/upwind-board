import { Injectable } from '@nestjs/common';
import { Skill } from '../../../domain/entities/skill.entity.js';
import { Page, PageRequest } from '../../../domain/repositories/pagination.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';

@Injectable()
export class ListSkillsUseCase {
  constructor(private readonly skills: SkillRepository) {}

  execute(request: PageRequest): Promise<Page<Skill>> {
    return this.skills.findPage(request);
  }
}
