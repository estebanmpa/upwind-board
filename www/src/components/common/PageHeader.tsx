import type { ReactNode } from 'react';
import { Group, Text, Title } from '@mantine/core';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="end" mb="xl" className="fade-in-up">
      <div>
        <Title order={2}>{title}</Title>
        {description && <Text c="dimmed">{description}</Text>}
      </div>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}
