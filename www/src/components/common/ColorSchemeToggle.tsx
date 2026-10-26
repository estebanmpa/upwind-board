import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme('light');
  const isDark = computedScheme === 'dark';

  return (
    <Tooltip label={isDark ? 'Modo claro' : 'Modo oscuro'}>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="xl"
        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
        aria-label="Cambiar tema"
      >
        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}
