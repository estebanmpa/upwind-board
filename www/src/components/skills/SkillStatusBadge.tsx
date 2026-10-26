import { Badge, type BadgeProps } from '@mantine/core';
import {
  NOT_STARTED_LABEL,
  SKILL_STATUS_COLORS,
  SKILL_STATUS_LABELS,
  type SkillStatus,
} from '@/types/skill';

interface SkillStatusBadgeProps extends Omit<BadgeProps, 'color' | 'children'> {
  status: SkillStatus | null;
}

export function SkillStatusBadge({ status, ...props }: SkillStatusBadgeProps) {
  return (
    <Badge
      variant={status ? 'light' : 'outline'}
      color={status ? SKILL_STATUS_COLORS[status] : 'gray'}
      {...props}
    >
      {status ? SKILL_STATUS_LABELS[status] : NOT_STARTED_LABEL}
    </Badge>
  );
}
