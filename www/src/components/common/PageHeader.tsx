import type { ReactNode } from 'react';
import { Group, Text, Title } from '@mantine/core';
import type { NavigateOptions } from '@tanstack/react-router';
import { BackButton } from './BackButton';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Shows a Back button; the page it goes to when there is no history. */
  back?: NavigateOptions;
}

export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <div className="fade-in-up">
      {back && <BackButton fallback={back} />}
      <Group justify="space-between" align="end" mb="xl">
        <div>
          <Title order={2}>{title}</Title>
          {description && <Text c="dimmed">{description}</Text>}
        </div>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </div>
  );
}
