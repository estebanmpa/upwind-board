import { Skill, SkillData } from '../entities/skill.entity.js';
import { Page, PageRequest } from './pagination.js';

export interface SkillTreeEntry {
  skill: Skill;
  /** Whether the skill has children in the table, active or not. */
  hasChildren: boolean;
}

export abstract class SkillRepository {
  abstract findById(id: string): Promise<Skill | null>;
  abstract findByIds(ids: string[]): Promise<Skill[]>;
  abstract findByCode(code: string): Promise<Skill | null>;
  abstract findPage(request: PageRequest): Promise<Page<Skill>>;
  /** Every node reachable from the roots, resolved with WITH RECURSIVE. */
  abstract findTree(options: {
    includeInactive: boolean;
  }): Promise<SkillTreeEntry[]>;
  /** Ids of the skill itself and all of its ancestors up to the root. */
  abstract findAncestorIds(id: string): Promise<string[]>;
  /** Subset of the given ids that have at least one child (i.e. are not leaves). */
  abstract findIdsWithChildren(ids: string[]): Promise<string[]>;
  abstract isUsedInRecords(id: string): Promise<boolean>;
  abstract create(data: SkillData): Promise<Skill>;
  abstract update(id: string, changes: Partial<SkillData>): Promise<Skill>;
  abstract delete(id: string): Promise<void>;
}
