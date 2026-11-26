import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { IconLogin2 } from '@tabler/icons-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/iam';

export function LoginPage() {
  const { redirectToIAM, isPending } = useAuth();

  return (
    <Paper className="glass hover-lift" radius="xl" p="xl" maw={420} w="100%" shadow="md">
      <Stack align="center" gap="lg" ta="center">
        <Logo />
        <Stack gap={4}>
          <Title order={2}>Welcome back</Title>
          <Text c="dimmed" size="sm">
            Log lessons and follow every student's IKO progression.
          </Text>
        </Stack>
        <Button
          variant="gradient"
          size="md"
          fullWidth
          leftSection={<IconLogin2 size={18} />}
          loading={isPending}
          onClick={redirectToIAM}
        >
          Sign in
        </Button>
      </Stack>
    </Paper>
  );
}
