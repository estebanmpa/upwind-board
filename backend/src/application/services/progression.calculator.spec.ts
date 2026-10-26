import { SkillStatus } from '../../domain/entities/skill-status.enum.js';
import { SkillRecordHistoryEntry } from '../../domain/repositories/lesson.repository.js';
import { SkillTreeNodeDto } from '../dtos/skills/skill-tree-node.dto.js';
import {
  buildProgressTree,
  currentStatusBySkill,
} from './progression.calculator.js';

const entry = (
  skillId: string,
  status: SkillStatus,
  lessonStartsAt: string,
  recordedAt = lessonStartsAt,
  lessonId = `lesson@${lessonStartsAt}`,
): SkillRecordHistoryEntry => ({
  skillId,
  status,
  lessonId,
  lessonStartsAt: new Date(lessonStartsAt),
  recordedAt: new Date(recordedAt),
});

describe('currentStatusBySkill', () => {
  it('returns an empty map when nothing was recorded', () => {
    expect(currentStatusBySkill([]).size).toBe(0);
  });

  it('keeps the status of the latest lesson, not the latest insert', () => {
    const current = currentStatusBySkill([
      entry(
        'a',
        SkillStatus.Mastered,
        '2026-03-10T10:00:00Z',
        '2026-03-10T12:00:00Z',
      ),
      // Logged later but for an earlier lesson: must not win.
      entry(
        'a',
        SkillStatus.Introduced,
        '2026-03-01T10:00:00Z',
        '2026-04-01T00:00:00Z',
      ),
      entry('a', SkillStatus.Practiced, '2026-03-05T10:00:00Z'),
    ]);
    expect(current.get('a')).toEqual({
      status: SkillStatus.Mastered,
      lessonId: 'lesson@2026-03-10T10:00:00Z',
      lessonStartsAt: new Date('2026-03-10T10:00:00Z'),
    });
  });

  it('allows the status to go down if the latest lesson says so', () => {
    const current = currentStatusBySkill([
      entry('a', SkillStatus.Mastered, '2026-03-01T10:00:00Z'),
      entry('a', SkillStatus.Practiced, '2026-03-02T10:00:00Z'),
    ]);
    expect(current.get('a')?.status).toBe(SkillStatus.Practiced);
  });

  it('breaks ties between lessons at the same time by record time', () => {
    const current = currentStatusBySkill([
      entry(
        'a',
        SkillStatus.Practiced,
        '2026-03-01T10:00:00Z',
        '2026-03-01T13:00:00Z',
        'l2',
      ),
      entry(
        'a',
        SkillStatus.Introduced,
        '2026-03-01T10:00:00Z',
        '2026-03-01T12:00:00Z',
        'l1',
      ),
    ]);
    expect(current.get('a')).toMatchObject({
      status: SkillStatus.Practiced,
      lessonId: 'l2',
    });
  });

  it('tracks each skill independently', () => {
    const current = currentStatusBySkill([
      entry('a', SkillStatus.Introduced, '2026-03-01T10:00:00Z'),
      entry('b', SkillStatus.Mastered, '2026-03-01T10:00:00Z'),
      entry('a', SkillStatus.Practiced, '2026-03-02T10:00:00Z'),
    ]);
    expect(current.get('a')?.status).toBe(SkillStatus.Practiced);
    expect(current.get('b')?.status).toBe(SkillStatus.Mastered);
  });
});

describe('buildProgressTree', () => {
  const node = (
    id: string,
    children: SkillTreeNodeDto[] = [],
    data: Partial<SkillTreeNodeDto> = {},
  ): SkillTreeNodeDto => ({
    id,
    parentId: null,
    code: id.toUpperCase(),
    name: id,
    description: null,
    sortOrder: 0,
    active: true,
    isLeaf: children.length === 0,
    children,
    ...data,
  });

  const current = currentStatusBySkill([
    entry('a1', SkillStatus.Introduced, '2026-03-01T10:00:00Z'),
    entry('a1', SkillStatus.Mastered, '2026-03-02T10:00:00Z', undefined, 'l2'),
    entry('a2', SkillStatus.Practiced, '2026-03-01T10:00:00Z'),
  ]);

  it('sets the current status on leaves and null on untouched leaves and groups', () => {
    const [l1] = buildProgressTree(
      [node('l1', [node('a', [node('a1'), node('a2')]), node('b')])],
      current,
    );
    const [a, b] = l1.children;

    expect(l1.status).toBeNull();
    expect(a.status).toBeNull();
    expect(a.children[0]).toMatchObject({
      status: SkillStatus.Mastered,
      lastLessonId: 'l2',
      lastWorkedAt: new Date('2026-03-02T10:00:00Z'),
    });
    expect(a.children[1].status).toBe(SkillStatus.Practiced);
    expect(b).toMatchObject({
      status: null,
      lastLessonId: null,
      lastWorkedAt: null,
    });
  });

  it('aggregates leaf counters up the tree', () => {
    const [l1] = buildProgressTree(
      [node('l1', [node('a', [node('a1'), node('a2')]), node('b')])],
      current,
    );
    expect(l1.summary).toEqual({
      totalSkills: 3,
      notStarted: 1,
      introduced: 0,
      practiced: 1,
      mastered: 1,
    });
    expect(l1.children[1].summary.totalSkills).toBe(1);
  });

  it('hides inactive skills unless the student worked on them', () => {
    const tree = buildProgressTree(
      [
        node('l1', [
          node('a', [
            node('a1', [], { active: false }),
            node('a3', [], { active: false }),
          ]),
        ]),
        node('old', [node('x')], { active: false }),
      ],
      current,
    );
    expect(tree.map((n) => n.id)).toEqual(['l1']);
    expect(tree[0].children[0].children.map((n) => n.id)).toEqual(['a1']);
  });

  it('never flags a group as leaf even when all its children are hidden', () => {
    const [l1] = buildProgressTree(
      [node('l1', [node('gone', [], { active: false })])],
      current,
    );
    expect(l1).toMatchObject({ isLeaf: false, children: [], status: null });
    expect(l1.summary.totalSkills).toBe(0);
  });
});
