import type { ReactNode } from 'react';
import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconMoodEmpty } from '@tabler/icons-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack align="center" gap="xs" py={60} ta="center">
      <ThemeIcon size={64} radius="xl" variant="light">
        <IconMoodEmpty size={34} />
      </ThemeIcon>
      <Title order={3}>{title}</Title>
      {description && <Text c="dimmed">{description}</Text>}
      {action}
    </Stack>
  );
}
