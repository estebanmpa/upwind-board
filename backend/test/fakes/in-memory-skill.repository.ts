import { randomUUID } from 'node:crypto';
import { Skill, SkillData } from '../../src/domain/entities/skill.entity.js';
import { NotFoundError } from '../../src/domain/errors/domain.error.js';
import { Page, PageRequest } from '../../src/domain/repositories/pagination.js';
import {
  SkillRepository,
  SkillTreeEntry,
} from '../../src/domain/repositories/skill.repository.js';

export class InMemorySkillRepository extends SkillRepository {
  readonly skills = new Map<string, Skill>();
  readonly skillIdsWithRecords = new Set<string>();

  /** Test helper: inserts a skill with sensible defaults. */
  add(data: Partial<Skill> & { code: string }): Skill {
    const now = new Date();
    const skill = new Skill({
      id: randomUUID(),
      parentId: null,
      name: data.code,
      description: null,
      sortOrder: 0,
      active: true,
      createdAt: now,
      updatedAt: now,
      ...data,
    });
    this.skills.set(skill.id, skill);
    return skill;
  }

  async findById(id: string): Promise<Skill | null> {
    return this.skills.get(id) ?? null;
  }

  async findByIds(ids: string[]): Promise<Skill[]> {
    return ids.flatMap((id) => this.skills.get(id) ?? []);
  }

  async findByCode(code: string): Promise<Skill | null> {
    return [...this.skills.values()].find((s) => s.code === code) ?? null;
  }

  async findPage({ page, limit }: PageRequest): Promise<Page<Skill>> {
    const all = [...this.skills.values()];
    return {
      items: all.slice((page - 1) * limit, page * limit),
      total: all.length,
      page,
      limit,
    };
  }

  async findTree({
    includeInactive,
  }: {
    includeInactive: boolean;
  }): Promise<SkillTreeEntry[]> {
    const all = [...this.skills.values()];
    return all
      .filter((s) => includeInactive || s.active)
      .map((skill) => ({
        skill,
        hasChildren: all.some((c) => c.parentId === skill.id),
      }));
  }

  async findAncestorIds(id: string): Promise<string[]> {
    const ids: string[] = [];
    let current = this.skills.get(id);
    while (current && !ids.includes(current.id)) {
      ids.push(current.id);
      current = current.parentId
        ? this.skills.get(current.parentId)
        : undefined;
    }
    return ids;
  }

  async findIdsWithChildren(ids: string[]): Promise<string[]> {
    const parents = new Set(
      [...this.skills.values()].map((s) => s.parentId).filter(Boolean),
    );
    return ids.filter((id) => parents.has(id));
  }

  async isUsedInRecords(id: string): Promise<boolean> {
    return this.skillIdsWithRecords.has(id);
  }

  async create(data: SkillData): Promise<Skill> {
    return this.add(data);
  }

  async update(id: string, changes: Partial<SkillData>): Promise<Skill> {
    const skill = this.skills.get(id);
    if (!skill) throw new NotFoundError('Skill', id);
    const defined = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== undefined),
    );
    const updated = Object.assign(new Skill(skill), defined, {
      updatedAt: new Date(),
    });
    this.skills.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.skills.delete(id);
  }
}
