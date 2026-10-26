import { readFile } from 'node:fs/promises';

/** A node of data/iko-skills.json. */
export interface SkillSeedNode {
  code: string;
  name: string;
  description?: string | null;
  /** Defaults to the position among its siblings (x10). */
  sortOrder?: number;
  children?: SkillSeedNode[];
}

/** An entry of data/instructors.json. */
export interface InstructorSeed {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ikoInstructorId?: string | null;
}

export interface FlatSkillSeed {
  code: string;
  parentCode: string | null;
  name: string;
  description: string | null;
  sortOrder: number;
}

const readJson = async <T>(file: string): Promise<T> =>
  JSON.parse(
    await readFile(new URL(`./data/${file}`, import.meta.url), 'utf8'),
  ) as T;

export const loadSkillSeed = () => readJson<SkillSeedNode[]>('iko-skills.json');
export const loadInstructorSeed = () =>
  readJson<InstructorSeed[]>('instructors.json');

/** Pre-order flattening: every parent comes before its children. */
export function flattenSkillSeed(
  nodes: SkillSeedNode[],
  parentCode: string | null = null,
): FlatSkillSeed[] {
  return nodes.flatMap((node, index) => [
    {
      code: node.code,
      parentCode,
      name: node.name,
      description: node.description ?? null,
      sortOrder: node.sortOrder ?? (index + 1) * 10,
    },
    ...flattenSkillSeed(node.children ?? [], node.code),
  ]);
}

/** Catches typos in the data file before touching the database. */
export function assertValidSkillSeed(skills: FlatSkillSeed[]): void {
  const seen = new Set<string>();
  for (const skill of skills) {
    if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(skill.code)) {
      throw new Error(`Invalid skill code in seed: "${skill.code}"`);
    }
    if (seen.has(skill.code)) {
      throw new Error(`Duplicated skill code in seed: "${skill.code}"`);
    }
    if (!skill.name?.trim()) {
      throw new Error(`Skill "${skill.code}" has no name`);
    }
    seen.add(skill.code);
  }
}
