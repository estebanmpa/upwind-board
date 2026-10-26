import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SKILL_USE_CASES } from '../../application/use-cases/skills/index.js';
import { SkillRepository } from '../../domain/repositories/skill.repository.js';
import { SkillOrmEntity } from '../persistence/type-orm/entities/skill.orm-entity.js';
import { TypeOrmSkillRepository } from '../persistence/type-orm/repositories/type-orm-skill.repository.js';
import { SkillsController } from '../rest/controllers/skills.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([SkillOrmEntity])],
  controllers: [SkillsController],
  providers: [
    { provide: SkillRepository, useClass: TypeOrmSkillRepository },
    ...SKILL_USE_CASES,
  ],
  exports: [SkillRepository],
})
export class SkillsModule {}
