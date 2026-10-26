import type { ProgressSummary, SkillProgressNode } from '@/types/progress';
import type { SkillStatus } from '@/types/skill';

/** Percentage of skills at each status, for a stacked progress bar. */
export function summaryPercentages(
  summary: ProgressSummary,
): Record<SkillStatus, number> {
  const percent = (value: number) =>
    summary.totalSkills === 0 ? 0 : (value / summary.totalSkills) * 100;
  return {
    mastered: percent(summary.mastered),
    practiced: percent(summary.practiced),
    introduced: percent(summary.introduced),
  };
}

export function masteredPercent(summary: ProgressSummary): number {
  return Math.round(summaryPercentages(summary).mastered);
}

/** The first level (root) whose skills are not all mastered. */
export function currentLevel(tree: SkillProgressNode[]): SkillProgressNode | undefined {
  return tree.find(
    (level) =>
      level.summary.totalSkills > 0 && level.summary.mastered < level.summary.totalSkills,
  );
}

/** Current status per leaf skill id, to hint the instructor while logging. */
export function statusBySkill(tree: SkillProgressNode[]): Map<string, SkillStatus> {
  const result = new Map<string, SkillStatus>();
  const visit = (node: SkillProgressNode) => {
    if (node.isLeaf && node.status) result.set(node.id, node.status);
    node.children.forEach(visit);
  };
  tree.forEach(visit);
  return result;
}
