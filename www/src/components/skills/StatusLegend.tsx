import { Group } from '@mantine/core';
import { SKILL_STATUSES } from '@/types/skill';
import { SkillStatusBadge } from './SkillStatusBadge';

export function StatusLegend() {
  return (
    <Group gap="xs">
      {SKILL_STATUSES.map((status) => (
        <SkillStatusBadge key={status} status={status} size="sm" />
      ))}
      <SkillStatusBadge status={null} size="sm" />
    </Group>
  );
}
