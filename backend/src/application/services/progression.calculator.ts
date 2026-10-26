import { SkillStatus } from '../../domain/entities/skill-status.enum.js';
import { SkillRecordHistoryEntry } from '../../domain/repositories/lesson.repository.js';
import {
  ProgressSummaryDto,
  SkillProgressNodeDto,
} from '../dtos/progress/student-progress.dto.js';
import { SkillTreeNodeDto } from '../dtos/skills/skill-tree-node.dto.js';

export interface CurrentSkillStatus {
  status: SkillStatus;
  lessonId: string;
  lessonStartsAt: Date;
}

const isLater = (a: SkillRecordHistoryEntry, b: SkillRecordHistoryEntry) => {
  const byLesson = a.lessonStartsAt.getTime() - b.lessonStartsAt.getTime();
  if (byLesson !== 0) return byLesson > 0;
  // Same lesson time: the most recently written record wins.
  return a.recordedAt.getTime() > b.recordedAt.getTime();
};

/**
 * Current status per skill: the one recorded in the latest lesson
 * (by lessons.starts_at), regardless of whether it is higher or lower than before.
 */
export function currentStatusBySkill(
  history: SkillRecordHistoryEntry[],
): Map<string, CurrentSkillStatus> {
  const latest = new Map<string, SkillRecordHistoryEntry>();
  for (const entry of history) {
    const current = latest.get(entry.skillId);
    if (!current || isLater(entry, current)) latest.set(entry.skillId, entry);
  }
  return new Map(
    [...latest].map(([skillId, e]) => [
      skillId,
      {
        status: e.status,
        lessonId: e.lessonId,
        lessonStartsAt: e.lessonStartsAt,
      },
    ]),
  );
}

export const emptySummary = (): ProgressSummaryDto => ({
  totalSkills: 0,
  notStarted: 0,
  introduced: 0,
  practiced: 0,
  mastered: 0,
});

export function addSummaries(
  target: ProgressSummaryDto,
  source: ProgressSummaryDto,
): ProgressSummaryDto {
  target.totalSkills += source.totalSkills;
  target.notStarted += source.notStarted;
  target.introduced += source.introduced;
  target.practiced += source.practiced;
  target.mastered += source.mastered;
  return target;
}

const leafSummary = (status: SkillStatus | null): ProgressSummaryDto => {
  const summary = emptySummary();
  summary.totalSkills = 1;
  if (status === null) summary.notStarted = 1;
  else summary[status] = 1;
  return summary;
};

/**
 * Decorates the skill tree with the student's current status on each leaf and
 * per-node counters. Inactive skills are only kept when the student has
 * worked on them (directly or somewhere below them).
 */
export function buildProgressTree(
  tree: SkillTreeNodeDto[],
  current: Map<string, CurrentSkillStatus>,
): SkillProgressNodeDto[] {
  const visit = (node: SkillTreeNodeDto): SkillProgressNodeDto | null => {
    const children = node.children
      .map(visit)
      .filter((child): child is SkillProgressNodeDto => child !== null);
    const leafStatus = node.isLeaf ? current.get(node.id) : undefined;
    const summary = node.isLeaf
      ? leafSummary(leafStatus?.status ?? null)
      : children.reduce(
          (acc, c) => addSummaries(acc, c.summary),
          emptySummary(),
        );

    const worked = summary.totalSkills - summary.notStarted > 0;
    if (!node.active && !worked) return null;

    return {
      id: node.id,
      parentId: node.parentId,
      code: node.code,
      name: node.name,
      description: node.description,
      sortOrder: node.sortOrder,
      active: node.active,
      isLeaf: node.isLeaf,
      status: leafStatus?.status ?? null,
      lastLessonId: leafStatus?.lessonId ?? null,
      lastWorkedAt: leafStatus?.lessonStartsAt ?? null,
      summary,
      children,
    };
  };

  return tree
    .map(visit)
    .filter((node): node is SkillProgressNodeDto => node !== null);
}
