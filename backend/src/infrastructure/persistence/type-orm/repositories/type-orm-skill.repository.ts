import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Skill, SkillData } from '../../../../domain/entities/skill.entity.js';
import { NotFoundError } from '../../../../domain/errors/domain.error.js';
import {
  Page,
  PageRequest,
} from '../../../../domain/repositories/pagination.js';
import {
  SkillRepository,
  SkillTreeEntry,
} from '../../../../domain/repositories/skill.repository.js';
import { SkillOrmEntity } from '../entities/skill.orm-entity.js';
import { SkillMapper } from '../mappers/skill.mapper.js';
import { withoutUndefined } from './without-undefined.js';

interface SkillTreeRow {
  id: string;
  parent_id: string | null;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  has_children: boolean;
}

@Injectable()
export class TypeOrmSkillRepository extends SkillRepository {
  constructor(
    @InjectRepository(SkillOrmEntity)
    private readonly repository: Repository<SkillOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Skill | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? SkillMapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Skill[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((e) => SkillMapper.toDomain(e));
  }

  async findByCode(code: string): Promise<Skill | null> {
    const entity = await this.repository.findOneBy({ code });
    return entity ? SkillMapper.toDomain(entity) : null;
  }

  async findPage({ page, limit }: PageRequest): Promise<Page<Skill>> {
    const [entities, total] = await this.repository.findAndCount({
      order: { code: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: entities.map((e) => SkillMapper.toDomain(e)),
      total,
      page,
      limit,
    };
  }

  async findTree({
    includeInactive,
  }: {
    includeInactive: boolean;
  }): Promise<SkillTreeEntry[]> {
    // Walks down from the roots. Filtering inactive nodes in both branches of
    // the CTE also prunes their whole subtree.
    const activeFilter = includeInactive ? '' : 'AND s.active';
    const rows: SkillTreeRow[] = await this.repository.query(`
      WITH RECURSIVE tree AS (
        SELECT s.*, 0 AS depth
        FROM skills s
        WHERE s.parent_id IS NULL ${activeFilter}
        UNION ALL
        SELECT s.*, t.depth + 1
        FROM skills s
        JOIN tree t ON s.parent_id = t.id
        WHERE TRUE ${activeFilter}
      )
      SELECT t.*,
             EXISTS (SELECT 1 FROM skills c WHERE c.parent_id = t.id) AS has_children
      FROM tree t
      ORDER BY t.depth, t.sort_order, t.name
    `);
    return rows.map((row) => ({
      skill: new Skill({
        id: row.id,
        parentId: row.parent_id,
        code: row.code,
        name: row.name,
        description: row.description,
        sortOrder: row.sort_order,
        active: row.active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }),
      hasChildren: row.has_children,
    }));
  }

  async findAncestorIds(id: string): Promise<string[]> {
    // UNION (not UNION ALL) stops the walk even if bad data had a cycle.
    const rows: { id: string }[] = await this.repository.query(
      `
      WITH RECURSIVE ancestors AS (
        SELECT id, parent_id FROM skills WHERE id = $1
        UNION
        SELECT s.id, s.parent_id
        FROM skills s
        JOIN ancestors a ON s.id = a.parent_id
      )
      SELECT id FROM ancestors
    `,
      [id],
    );
    return rows.map((row) => row.id);
  }

  async findIdsWithChildren(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows: { parent_id: string }[] = await this.repository.query(
      `SELECT DISTINCT parent_id FROM skills WHERE parent_id = ANY($1::uuid[])`,
      [ids],
    );
    return rows.map((row) => row.parent_id);
  }

  async isUsedInRecords(id: string): Promise<boolean> {
    const rows: { used: boolean }[] = await this.repository.query(
      `SELECT EXISTS (SELECT 1 FROM lesson_skill_records WHERE skill_id = $1) AS used`,
      [id],
    );
    return rows[0].used;
  }

  async create(data: SkillData): Promise<Skill> {
    const saved = await this.repository.save(this.repository.create(data));
    return SkillMapper.toDomain(saved);
  }

  async update(id: string, changes: Partial<SkillData>): Promise<Skill> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundError('Skill', id);
    this.repository.merge(entity, withoutUndefined(changes));
    return SkillMapper.toDomain(await this.repository.save(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
