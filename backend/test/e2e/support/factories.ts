import { TestApp } from './test-app.js';

export async function createInstructor(t: TestApp, data: object = {}) {
  const res = await t
    .http()
    .post('/instructors')
    .send({
      firstName: 'Ana',
      lastName: 'Ríos',
      email: `ana.${Math.random().toString(36).slice(2)}@example.com`,
      phone: '+54 9 11 5555 0000',
      ...data,
    })
    .expect(201);
  return res.body as { id: string };
}

export async function createStudent(t: TestApp, data: object = {}) {
  const res = await t
    .http()
    .post('/students')
    .send({
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+54 9 11 5555 1111',
      emergencyContactName: 'María Pérez',
      emergencyContactPhone: '+54 9 11 5555 2222',
      ...data,
    })
    .expect(201);
  return res.body as { id: string };
}

export async function createSkill(
  t: TestApp,
  data: { code: string; parentId?: string; sortOrder?: number },
) {
  const res = await t
    .http()
    .post('/skills')
    .send({ name: data.code, ...data })
    .expect(201);
  return res.body as { id: string; code: string };
}

/**
 * L1 ─┬─ L1-A        (leaf)
 *     └─ L1-B ── L1-B-1 (leaf)
 * L2 ─── L2-A        (leaf)
 */
export async function createSkillTree(t: TestApp) {
  const l1 = await createSkill(t, { code: 'L1', sortOrder: 1 });
  const l1a = await createSkill(t, {
    code: 'L1-A',
    parentId: l1.id,
    sortOrder: 1,
  });
  const l1b = await createSkill(t, {
    code: 'L1-B',
    parentId: l1.id,
    sortOrder: 2,
  });
  const l1b1 = await createSkill(t, { code: 'L1-B-1', parentId: l1b.id });
  const l2 = await createSkill(t, { code: 'L2', sortOrder: 2 });
  const l2a = await createSkill(t, { code: 'L2-A', parentId: l2.id });
  return { l1, l1a, l1b, l1b1, l2, l2a };
}
