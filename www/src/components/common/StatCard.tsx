import type { ReactNode } from 'react';
import { Card, Group, Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: Icon;
  color: string;
  hint?: string;
}

export function StatCard({ label, value, icon: StatIcon, color, hint }: StatCardProps) {
  return (
    <Card withBorder padding="lg" className="hover-lift">
      <Group justify="space-between" wrap="nowrap">
        <div>
          <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>
            {label}
          </Text>
          <Text fz={28} fw={800}>
            {value}
          </Text>
          {hint && (
            <Text fz="xs" c="dimmed">
              {hint}
            </Text>
          )}
        </div>
        <ThemeIcon size={52} radius="xl" variant="light" color={color}>
          <StatIcon size={28} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}
