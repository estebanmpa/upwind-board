import { Progress, Tooltip } from '@mantine/core';
import type { ProgressSummary } from '@/types/progress';
import { SKILL_STATUS_COLORS, SKILL_STATUS_LABELS, SKILL_STATUSES } from '@/types/skill';
import { summaryPercentages } from '@/utils/progress';

/** Stacked bar: mastered, practiced and introduced shares of a node's skills. */
export function ProgressBar({
  summary,
  size = 'lg',
}: {
  summary: ProgressSummary;
  size?: string;
}) {
  const percentages = summaryPercentages(summary);
  const ordered = [...SKILL_STATUSES].reverse();
  return (
    <Progress.Root size={size} radius="xl" aria-label="Progreso">
      {ordered.map((status) => (
        <Tooltip
          key={status}
          label={`${SKILL_STATUS_LABELS[status]}: ${summary[status]}`}
          withArrow
        >
          <Progress.Section
            value={percentages[status]}
            color={SKILL_STATUS_COLORS[status]}
            style={{ transition: 'width 600ms ease' }}
          />
        </Tooltip>
      ))}
    </Progress.Root>
  );
}
