import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { NavigateOptions } from '@tanstack/react-router';
import { useGoBack } from '@/hooks/useGoBack';

export function BackButton({ fallback }: { fallback: NavigateOptions }) {
  const goBack = useGoBack(fallback);
  return (
    <Button
      variant="subtle"
      color="gray"
      size="compact-sm"
      leftSection={<IconArrowLeft size={16} />}
      onClick={goBack}
      mb="xs"
      ml={-8}
    >
      Back
    </Button>
  );
}
