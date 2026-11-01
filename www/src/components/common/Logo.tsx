import { Group, Text } from '@mantine/core';

export function Logo() {
  return (
    <Group gap={8} wrap="nowrap">
      <img src="/favicon.svg" alt="" width={34} height={34} />
      <Text fw={800} fz={22} className="gradient-text" style={{ letterSpacing: -0.5 }}>
        Upwind Board
      </Text>
    </Group>
  );
}
