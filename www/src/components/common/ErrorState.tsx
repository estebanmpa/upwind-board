import { Alert, Button, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { ErrorComponentProps } from '@tanstack/react-router';

export function ErrorState({ error, reset }: ErrorComponentProps) {
  return (
    <Stack maw={520} mx="auto" my={60}>
      <Alert color="red" icon={<IconAlertTriangle />} title="Algo salió mal">
        {error.message}
      </Alert>
      <Button variant="light" onClick={reset}>
        Reintentar
      </Button>
    </Stack>
  );
}
