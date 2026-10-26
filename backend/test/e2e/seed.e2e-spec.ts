import {
  loadInstructorSeed,
  loadSkillSeed,
} from '../../src/infrastructure/seed/seed-data.js';
import { seed } from '../../src/infrastructure/seed/seeder.js';
import { createTestApp, resetDatabase, TestApp } from './support/test-app.js';

describe('Seed (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
    await resetDatabase(t.dataSource);
  });

  afterAll(async () => {
    await t.app.close();
  });

  const data = async () => ({
    skills: await loadSkillSeed(),
    instructors: await loadInstructorSeed(),
  });

  it('is idempotent and builds the IKO tree', async () => {
    const first = await seed(t.dataSource, await data());
    const firstIds = await t.dataSource.query(
      'SELECT id, code FROM skills ORDER BY code',
    );
    // A manual edit to a seeded skill's state is preserved...
    await t.dataSource.query(
      `UPDATE skills SET active = false WHERE code = 'L3-RIGHT-OF-WAY'`,
    );

    const second = await seed(t.dataSource, await data());

    expect(first).toEqual({ skills: 19, instructorsCreated: 1 });
    expect(second).toEqual({ skills: 19, instructorsCreated: 0 });
    expect(
      await t.dataSource.query('SELECT id, code FROM skills ORDER BY code'),
    ).toEqual(firstIds);
    const [{ active }] = await t.dataSource.query(
      `SELECT active FROM skills WHERE code = 'L3-RIGHT-OF-WAY'`,
    );
    expect(active).toBe(false);

    const tree = (await t.http().get('/skills/tree').expect(200)).body;
    expect(tree.map((n: { code: string }) => n.code)).toEqual([
      'L1',
      'L2',
      'L3',
    ]);
    expect(tree[0].children.map((n: { code: string }) => n.code)).toEqual([
      'L1-SAFETY',
      'L1-WIND-WINDOW',
      'L1-EQUIPMENT-SETUP',
      'L1-ASSISTED-LAUNCH-LANDING',
      'L1-KITE-PILOTING',
      'L1-DOWNWIND-BODY-DRAG',
    ]);
    expect(tree[2].children).toHaveLength(5); // inactive one hidden

    const instructors = (await t.http().get('/instructors').expect(200)).body;
    expect(instructors.items[0].email).toBe('instructor@example.com');
  });
});
