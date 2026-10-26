import { DataSource, EntityManager } from 'typeorm';
import {
  assertValidSkillSeed,
  FlatSkillSeed,
  flattenSkillSeed,
  InstructorSeed,
  SkillSeedNode,
} from './seed-data.js';

export interface SeedResult {
  skills: number;
  instructorsCreated: number;
}

/**
 * Idempotent seed. Skills are upserted by code (name, description, parent and
 * sort order follow the data file; `active` is only set on insert). Instructors
 * are inserted by email and left untouched if they already exist.
 */
export async function seed(
  dataSource: DataSource,
  data: { skills: SkillSeedNode[]; instructors: InstructorSeed[] },
): Promise<SeedResult> {
  const skills = flattenSkillSeed(data.skills);
  assertValidSkillSeed(skills);

  return dataSource.transaction(async (manager) => {
    await assertParentsAreNotEvaluated(manager, skills);
    await upsertSkills(manager, skills);
    return {
      skills: skills.length,
      instructorsCreated: await insertInstructors(manager, data.instructors),
    };
  });
}

/** Leaves with lesson records cannot become groups (see skill rules). */
async function assertParentsAreNotEvaluated(
  manager: EntityManager,
  skills: FlatSkillSeed[],
): Promise<void> {
  const parentCodes = [
    ...new Set(skills.flatMap((s) => (s.parentCode ? [s.parentCode] : []))),
  ];
  const rows: { code: string }[] = await manager.query(
    `SELECT DISTINCT s.code
     FROM skills s
     JOIN lesson_skill_records r ON r.skill_id = s.id
     WHERE s.code = ANY($1::text[])`,
    [parentCodes],
  );
  if (rows.length > 0) {
    throw new Error(
      `These skills have lesson records and cannot get children: ${rows
        .map((r) => r.code)
        .join(', ')}`,
    );
  }
}

async function upsertSkills(
  manager: EntityManager,
  skills: FlatSkillSeed[],
): Promise<void> {
  const idByCode = new Map<string, string>();
  for (const skill of skills) {
    const parentId = skill.parentCode ? idByCode.get(skill.parentCode)! : null;
    const [row]: { id: string }[] = await manager.query(
      `INSERT INTO skills (parent_id, code, name, description, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT ON CONSTRAINT uq_skills_code DO UPDATE SET
         parent_id = EXCLUDED.parent_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         sort_order = EXCLUDED.sort_order,
         updated_at = CASE
           WHEN (skills.parent_id, skills.name, skills.description, skills.sort_order)
             IS DISTINCT FROM
             (EXCLUDED.parent_id, EXCLUDED.name, EXCLUDED.description, EXCLUDED.sort_order)
           THEN now() ELSE skills.updated_at END
       RETURNING id`,
      [parentId, skill.code, skill.name, skill.description, skill.sortOrder],
    );
    idByCode.set(skill.code, row.id);
  }
}

async function insertInstructors(
  manager: EntityManager,
  instructors: InstructorSeed[],
): Promise<number> {
  let created = 0;
  for (const instructor of instructors) {
    const rows: unknown[] = await manager.query(
      `INSERT INTO instructors (first_name, last_name, email, phone, iko_instructor_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ON CONSTRAINT uq_instructors_email DO NOTHING
       RETURNING id`,
      [
        instructor.firstName,
        instructor.lastName,
        instructor.email.trim().toLowerCase(),
        instructor.phone,
        instructor.ikoInstructorId ?? null,
      ],
    );
    created += rows.length;
  }
  return created;
}
