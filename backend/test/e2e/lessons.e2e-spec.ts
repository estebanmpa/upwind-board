import { SkillStatus } from '../../src/domain/entities/skill-status.enum.js';
import {
  createInstructor,
  createSkillTree,
  createStudent,
} from './support/factories.js';
import { createTestApp, resetDatabase, TestApp } from './support/test-app.js';

describe('Lessons (e2e)', () => {
  let t: TestApp;
  let skills: Awaited<ReturnType<typeof createSkillTree>>;
  let instructor: { id: string };
  let juan: { id: string };
  let lucia: { id: string };

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
    juan = await createStudent(t);
    lucia = await createStudent(t, { firstName: 'Lucía', lastName: 'Gómez' });
  });

  const lessonBody = () => ({
    instructorId: instructor.id,
    startsAt: '2026-11-02T15:00:00-03:00',
    durationMinutes: 120,
    spot: 'Punta Lara',
    windDirection: 'no',
    windMinKnots: 14,
    windMaxKnots: 18,
    students: [
      {
        studentId: juan.id,
        kiteSizeM2: 9,
        board: 'TT 138',
        skillRecords: [
          { skillId: skills.l1a.id, status: SkillStatus.Mastered },
          {
            skillId: skills.l1b1.id,
            status: SkillStatus.Introduced,
            notes: 'Needs more time',
          },
        ],
      },
      {
        studentId: lucia.id,
        skillRecords: [
          { skillId: skills.l1a.id, status: SkillStatus.Practiced },
        ],
      },
    ],
  });

  type LessonStudentBody = {
    id: string;
    studentId: string;
    skillRecords: { id: string; skillId: string }[];
  };
  const participation = (
    lesson: { students: LessonStudentBody[] },
    id: string,
  ) => lesson.students.find((s) => s.studentId === id)!;

  const countRows = async (table: string) =>
    Number(
      (await t.dataSource.query(`SELECT COUNT(*) AS n FROM ${table}`))[0].n,
    );

  describe('POST /lessons', () => {
    it('creates the lesson with its students and skill records', async () => {
      const res = await t
        .http()
        .post('/lessons')
        .send(lessonBody())
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        instructorId: instructor.id,
        startsAt: '2026-11-02T18:00:00.000Z',
        durationMinutes: 120,
        spot: 'Punta Lara',
        windDirection: 'NO',
        windMinKnots: 14,
        windMaxKnots: 18,
        notes: null,
      });
      expect(res.body.students).toHaveLength(2);
      const juanRow = participation(res.body, juan.id);
      expect(res.body.instructor).toEqual({
        id: instructor.id,
        firstName: 'Ana',
        lastName: 'Ríos',
      });
      expect(juanRow).toMatchObject({
        student: { id: juan.id, firstName: 'Juan', lastName: 'Pérez' },
        kiteSizeM2: 9,
        board: 'TT 138',
        notes: null,
      });
      expect(juanRow.skillRecords).toHaveLength(2);
      expect(juanRow.skillRecords).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            skillId: skills.l1a.id,
            status: 'mastered',
            notes: null,
          }),
          expect.objectContaining({
            skillId: skills.l1b1.id,
            status: 'introduced',
            notes: 'Needs more time',
          }),
        ]),
      );
      expect(participation(res.body, lucia.id).skillRecords).toHaveLength(1);

      const fetched = await t.http().get(`/lessons/${res.body.id}`).expect(200);
      expect(fetched.body).toEqual(res.body);
      expect(await countRows('lesson_skill_records')).toBe(3);
    });

    it('rejects records on a non-leaf skill without writing anything', async () => {
      const body = lessonBody();
      body.students[1].skillRecords.push({
        skillId: skills.l1b.id,
        status: SkillStatus.Practiced,
      });

      const res = await t.http().post('/lessons').send(body).expect(400);
      expect(res.body.message).toMatch(/Only leaf skills/);
      expect(await countRows('lessons')).toBe(0);
      expect(await countRows('lesson_students')).toBe(0);
    });

    it('returns 404 for unknown students', async () => {
      const body = lessonBody();
      body.students[0].studentId = '00000000-0000-4000-8000-000000000000';
      await t.http().post('/lessons').send(body).expect(404);
    });

    it('validates the payload', async () => {
      const res = await t
        .http()
        .post('/lessons')
        .send({
          ...lessonBody(),
          startsAt: '2026-11-02T15:00:00',
          durationMinutes: 0,
          windDirection: 'W',
          students: [],
        })
        .expect(400);
      expect(res.body.message).toEqual(
        expect.arrayContaining([
          'startsAt must include a timezone offset (e.g. Z or -03:00)',
          'durationMinutes must not be less than 1',
          expect.stringContaining('windDirection must be one of'),
          'students must contain at least 1 elements',
        ]),
      );
    });

    it('rejects an inverted wind range', async () => {
      await t
        .http()
        .post('/lessons')
        .send({ ...lessonBody(), windMinKnots: 20, windMaxKnots: 10 })
        .expect(400);
    });
  });

  describe('PATCH /lessons/:id', () => {
    it('updates fields, merges students and replaces their records', async () => {
      const created = (await t.http().post('/lessons').send(lessonBody())).body;
      const juanRow = participation(created, juan.id);
      const keptRecord = juanRow.skillRecords.find(
        (r) => r.skillId === skills.l1a.id,
      )!;

      const res = await t
        .http()
        .patch(`/lessons/${created.id}`)
        .send({
          spot: 'Magdalena',
          windDirection: null,
          students: [
            {
              studentId: juan.id,
              board: null,
              skillRecords: [
                { skillId: skills.l1a.id, status: SkillStatus.Mastered },
                { skillId: skills.l2a.id, status: SkillStatus.Introduced },
              ],
            },
          ],
        })
        .expect(200);

      expect(res.body).toMatchObject({
        spot: 'Magdalena',
        windDirection: null,
        windMinKnots: 14,
      });
      expect(res.body.students).toHaveLength(1);
      expect(res.body.students[0]).toMatchObject({
        id: juanRow.id,
        kiteSizeM2: 9,
        board: null,
      });
      const records: { id: string; skillId: string }[] =
        res.body.students[0].skillRecords;
      expect(records.map((r) => r.skillId).sort()).toEqual(
        [skills.l1a.id, skills.l2a.id].sort(),
      );
      expect(records.find((r) => r.skillId === skills.l1a.id)!.id).toBe(
        keptRecord.id,
      );
      // Lucía's participation and record are gone, the L1-B-1 record too.
      expect(await countRows('lesson_students')).toBe(1);
      expect(await countRows('lesson_skill_records')).toBe(2);
    });

    it('keeps students untouched when they are not sent', async () => {
      const created = (await t.http().post('/lessons').send(lessonBody())).body;
      const res = await t
        .http()
        .patch(`/lessons/${created.id}`)
        .send({ notes: 'Gusty' })
        .expect(200);
      expect(res.body.notes).toBe('Gusty');
      expect(res.body.students).toEqual(created.students);
    });

    it('returns 404 for an unknown lesson', async () => {
      await t
        .http()
        .patch('/lessons/00000000-0000-4000-8000-000000000000')
        .send({ notes: 'x' })
        .expect(404);
    });
  });

  it('DELETE /lessons/:id removes the lesson and its records', async () => {
    const created = (await t.http().post('/lessons').send(lessonBody())).body;
    await t.http().delete(`/lessons/${created.id}`).expect(204);
    await t.http().get(`/lessons/${created.id}`).expect(404);
    expect(await countRows('lesson_skill_records')).toBe(0);
  });

  it('protects instructors, students and skills that are in use', async () => {
    await t.http().post('/lessons').send(lessonBody()).expect(201);
    await t.http().delete(`/instructors/${instructor.id}`).expect(409);
    await t.http().delete(`/students/${juan.id}`).expect(409);
    await t.http().delete(`/skills/${skills.l1a.id}`).expect(409);
    await t
      .http()
      .post('/skills')
      .send({ code: 'L1-A-1', name: 'Sub', parentId: skills.l1a.id })
      .expect(409);
  });

  it('GET /lessons filters by student and paginates', async () => {
    await t.http().post('/lessons').send(lessonBody()).expect(201);
    await t
      .http()
      .post('/lessons')
      .send({
        ...lessonBody(),
        startsAt: '2026-11-03T15:00:00-03:00',
        students: [{ studentId: lucia.id }],
      })
      .expect(201);

    const all = await t.http().get('/lessons?limit=1').expect(200);
    expect(all.body).toMatchObject({ total: 2, page: 1, limit: 1 });
    expect(all.body.items[0].startsAt).toBe('2026-11-03T18:00:00.000Z');

    const juans = await t
      .http()
      .get(`/lessons?studentId=${juan.id}`)
      .expect(200);
    expect(juans.body.total).toBe(1);
  });
});
