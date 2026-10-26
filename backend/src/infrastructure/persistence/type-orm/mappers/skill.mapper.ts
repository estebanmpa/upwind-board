import { Skill } from '../../../../domain/entities/skill.entity.js';
import { SkillOrmEntity } from '../entities/skill.orm-entity.js';

export class SkillMapper {
  static toDomain(entity: SkillOrmEntity): Skill {
    return new Skill({
      id: entity.id,
      parentId: entity.parentId,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      sortOrder: entity.sortOrder,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
