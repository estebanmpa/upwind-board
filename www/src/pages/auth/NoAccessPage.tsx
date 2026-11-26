import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/iam';

/** The IAM account exists but grants nothing on Upwind Board. */
export function NoAccessPage() {
  const { payload, logout, isPending } = useAuth();
  const navigate = useNavigate();
  const signOut = () => logout().then(() => navigate({ to: '/login' }));

  return (
    <Paper className="glass" radius="xl" p="xl" maw={440} w="100%" shadow="md">
      <Stack align="center" ta="center">
        <IconLock size={40} color="var(--mantine-color-orange-6)" />
        <Title order={3}>No access to Upwind Board</Title>
        <Text c="dimmed" size="sm">
          {payload
            ? `${payload.email} is signed in, but`
            : 'Your account is signed in, but'}{' '}
          it has no permissions on this application. Ask an administrator to grant you
          access, or sign in with another account.
        </Text>
        <Button variant="light" loading={isPending} onClick={signOut}>
          Sign in with another account
        </Button>
      </Stack>
    </Paper>
  );
}
