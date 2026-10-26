import { SkillStatus } from '../../src/domain/entities/skill-status.enum.js';
import {
  createInstructor,
  createSkillTree,
  createStudent,
} from './support/factories.js';
import { createTestApp, resetDatabase, TestApp } from './support/test-app.js';

interface ProgressNode {
  code: string;
  isLeaf: boolean;
  status: string | null;
  lastLessonId: string | null;
  summary: Record<string, number>;
  children: ProgressNode[];
}

const findNode = (
  nodes: ProgressNode[],
  code: string,
): ProgressNode | undefined => {
  for (const node of nodes) {
    if (node.code === code) return node;
    const found = findNode(node.children, code);
    if (found) return found;
  }
  return undefined;
};

describe('Student progress (e2e)', () => {
  let t: TestApp;
  let skills: Awaited<ReturnType<typeof createSkillTree>>;
  let instructor: { id: string };
  let student: { id: string };

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.app.close();
  });

  beforeEach(async () => {
    await resetDatabase(t.dataSource);
    skills = await createSkillTree(t);
    instructor = await createInstructor(t);
    student = await createStudent(t);
  });

  const createLesson = async (
    startsAt: string,
    durationMinutes: number,
    records: { skillId: string; status: SkillStatus }[],
    studentId = student.id,
  ) =>
    (
      await t
        .http()
        .post('/lessons')
        .send({
          instructorId: instructor.id,
          startsAt,
          durationMinutes,
          spot: 'Punta Lara',
          students: [{ studentId, skillRecords: records }],
        })
        .expect(201)
    ).body as { id: string };

  it('returns the tree with null statuses and zero totals for a new student', async () => {
    const res = await t
      .http()
      .get(`/students/${student.id}/progress`)
      .expect(200);

    expect(res.body).toMatchObject({
      studentId: student.id,
      totalLessons: 0,
      totalMinutes: 0,
      totalHours: 0,
      summary: { totalSkills: 3, notStarted: 3 },
    });
    expect(res.body.tree.map((n: ProgressNode) => n.code)).toEqual([
      'L1',
      'L2',
    ]);
    expect(findNode(res.body.tree, 'L1-B-1')).toMatchObject({
      isLeaf: true,
      status: null,
    });
  });

  it('uses the latest lesson by date, not by insertion order', async () => {
    const latest = await createLesson('2026-11-10T15:00:00Z', 120, [
      { skillId: skills.l1a.id, status: SkillStatus.Mastered },
      { skillId: skills.l1b1.id, status: SkillStatus.Practiced },
    ]);
    // Logged afterwards, but it happened earlier.
    await createLesson('2026-11-01T15:00:00Z', 90, [
      { skillId: skills.l1a.id, status: SkillStatus.Introduced },
      { skillId: skills.l2a.id, status: SkillStatus.Introduced },
    ]);
    // Another student's lessons must not leak into this progress.
    const other = await createStudent(t, { firstName: 'Otro' });
    await createLesson(
      '2026-12-01T15:00:00Z',
      60,
      [{ skillId: skills.l1a.id, status: SkillStatus.Introduced }],
      other.id,
    );

    const res = await t
      .http()
      .get(`/students/${student.id}/progress`)
      .expect(200);

    expect(res.body).toMatchObject({
      totalLessons: 2,
      totalMinutes: 210,
      totalHours: 3.5,
      summary: {
        totalSkills: 3,
        notStarted: 0,
        introduced: 1,
        practiced: 1,
        mastered: 1,
      },
    });
    expect(findNode(res.body.tree, 'L1-A')).toMatchObject({
      status: 'mastered',
      lastLessonId: latest.id,
    });
    expect(findNode(res.body.tree, 'L1-B-1')?.status).toBe('practiced');
    expect(findNode(res.body.tree, 'L2-A')?.status).toBe('introduced');
    expect(findNode(res.body.tree, 'L1')).toMatchObject({
      isLeaf: false,
      status: null,
      summary: { totalSkills: 2, mastered: 1, practiced: 1 },
    });
  });

  it('reflects edits made to a lesson', async () => {
    const lesson = await createLesson('2026-11-10T15:00:00Z', 60, [
      { skillId: skills.l1a.id, status: SkillStatus.Introduced },
    ]);
    await t
      .http()
      .patch(`/lessons/${lesson.id}`)
      .send({
        students: [
          {
            studentId: student.id,
            skillRecords: [
              { skillId: skills.l1a.id, status: SkillStatus.Practiced },
            ],
          },
        ],
      })
      .expect(200);

    const res = await t
      .http()
      .get(`/students/${student.id}/progress`)
      .expect(200);
    expect(findNode(res.body.tree, 'L1-A')?.status).toBe('practiced');
  });

  it('keeps worked inactive skills and hides untouched ones', async () => {
    await createLesson('2026-11-10T15:00:00Z', 60, [
      { skillId: skills.l1a.id, status: SkillStatus.Practiced },
    ]);
    await t
      .http()
      .patch(`/skills/${skills.l1a.id}`)
      .send({ active: false })
      .expect(200);
    await t
      .http()
      .patch(`/skills/${skills.l2.id}`)
      .send({ active: false })
      .expect(200);

    const res = await t
      .http()
      .get(`/students/${student.id}/progress`)
      .expect(200);
    expect(findNode(res.body.tree, 'L1-A')?.status).toBe('practiced');
    expect(findNode(res.body.tree, 'L2')).toBeUndefined();
  });

  it('returns 404 for an unknown student and 400 for a malformed id', async () => {
    await t
      .http()
      .get('/students/00000000-0000-4000-8000-000000000000/progress')
      .expect(404);
    await t.http().get('/students/nope/progress').expect(400);
  });

  it('GET /students/:id/lessons returns the history with skill names', async () => {
    await createLesson('2026-11-01T15:00:00Z', 90, [
      { skillId: skills.l2a.id, status: SkillStatus.Introduced },
    ]);
    const latest = await createLesson('2026-11-10T15:00:00Z', 120, [
      { skillId: skills.l1a.id, status: SkillStatus.Mastered },
    ]);

    const res = await t
      .http()
      .get(`/students/${student.id}/lessons?limit=1`)
      .expect(200);

    expect(res.body).toMatchObject({ total: 2, page: 1, limit: 1 });
    expect(res.body.items[0]).toMatchObject({
      lessonId: latest.id,
      startsAt: '2026-11-10T15:00:00.000Z',
      durationMinutes: 120,
      instructor: { id: instructor.id, firstName: 'Ana' },
      skillRecords: [
        { skillId: skills.l1a.id, skillCode: 'L1-A', status: 'mastered' },
      ],
    });
  });
});
