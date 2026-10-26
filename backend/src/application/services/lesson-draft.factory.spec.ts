import { Lesson } from '../../domain/entities/lesson.entity.js';
import { SkillStatus } from '../../domain/entities/skill-status.enum.js';
import { createLessonDraft, mergeLessonDraft } from './lesson-draft.factory.js';

const lesson = (): Lesson =>
  new Lesson({
    id: 'lesson-1',
    instructorId: 'instructor-1',
    startsAt: new Date('2026-11-01T15:00:00Z'),
    durationMinutes: 120,
    spot: 'Punta Lara',
    windDirection: 'NO',
    windMinKnots: 14,
    windMaxKnots: 18,
    notes: null,
    students: [
      {
        id: 'ls-1',
        studentId: 'student-1',
        kiteSizeM2: 9,
        board: 'TT 138',
        notes: 'note',
        skillRecords: [
          {
            id: 'r-1',
            skillId: 'skill-a',
            status: SkillStatus.Introduced,
            notes: null,
          },
          {
            id: 'r-2',
            skillId: 'skill-b',
            status: SkillStatus.Practiced,
            notes: null,
          },
        ],
      },
      {
        id: 'ls-2',
        studentId: 'student-2',
        kiteSizeM2: null,
        board: null,
        notes: null,
        skillRecords: [],
      },
    ],
    createdAt: new Date(0),
    updatedAt: new Date(0),
  });

describe('createLessonDraft', () => {
  it('fills optional values with null and parses startsAt', () => {
    const draft = createLessonDraft({
      instructorId: 'instructor-1',
      startsAt: '2026-11-01T12:00:00-03:00',
      durationMinutes: 90,
      spot: 'Punta Lara',
      students: [
        {
          studentId: 'student-1',
          skillRecords: [{ skillId: 'skill-a', status: SkillStatus.Mastered }],
        },
        { studentId: 'student-2' },
      ],
    });

    expect(draft.id).toBeUndefined();
    expect(draft.startsAt.toISOString()).toBe('2026-11-01T15:00:00.000Z');
    expect(draft).toMatchObject({
      windDirection: null,
      windMinKnots: null,
      windMaxKnots: null,
      notes: null,
    });
    expect(draft.students[0]).toEqual({
      studentId: 'student-1',
      kiteSizeM2: null,
      board: null,
      notes: null,
      skillRecords: [
        { skillId: 'skill-a', status: SkillStatus.Mastered, notes: null },
      ],
    });
    expect(draft.students[1].skillRecords).toEqual([]);
  });
});

describe('mergeLessonDraft', () => {
  it('keeps everything that was not sent', () => {
    const current = lesson();
    const draft = mergeLessonDraft(current, { spot: 'Magdalena' });
    expect(draft.spot).toBe('Magdalena');
    expect(draft.windDirection).toBe('NO');
    expect(draft.students).toEqual(current.students);
  });

  it('clears nullable fields sent as null', () => {
    const draft = mergeLessonDraft(lesson(), {
      windDirection: null,
      windMaxKnots: null,
    });
    expect(draft.windDirection).toBeNull();
    expect(draft.windMaxKnots).toBeNull();
    expect(draft.windMinKnots).toBe(14);
  });

  it('matches students by studentId, drops missing ones and adds new ones', () => {
    const draft = mergeLessonDraft(lesson(), {
      students: [
        { studentId: 'student-1', board: null },
        { studentId: 'student-3' },
      ],
    });

    expect(draft.students).toHaveLength(2);
    expect(draft.students[0]).toMatchObject({
      id: 'ls-1',
      studentId: 'student-1',
      kiteSizeM2: 9,
      board: null,
      notes: 'note',
    });
    // skillRecords not sent: current records are kept with their ids.
    expect(draft.students[0].skillRecords.map((r) => r.id)).toEqual([
      'r-1',
      'r-2',
    ]);
    expect(draft.students[1]).toMatchObject({
      studentId: 'student-3',
      skillRecords: [],
    });
    expect(draft.students[1].id).toBeUndefined();
  });

  it('replaces skill records, keeping the id of the ones that remain', () => {
    const draft = mergeLessonDraft(lesson(), {
      students: [
        {
          studentId: 'student-1',
          skillRecords: [
            { skillId: 'skill-b', status: SkillStatus.Mastered },
            { skillId: 'skill-c', status: SkillStatus.Introduced, notes: 'n' },
          ],
        },
      ],
    });

    expect(draft.students[0].skillRecords).toEqual([
      {
        id: 'r-2',
        skillId: 'skill-b',
        status: SkillStatus.Mastered,
        notes: null,
      },
      {
        id: undefined,
        skillId: 'skill-c',
        status: SkillStatus.Introduced,
        notes: 'n',
      },
    ]);
  });
});
