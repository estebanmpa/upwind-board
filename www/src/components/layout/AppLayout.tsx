import type { ReactNode } from 'react';
import {
  AppShell,
  Burger,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCalendarEvent,
  IconLayoutDashboard,
  IconListTree,
  IconPlus,
  IconSchool,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ColorSchemeToggle } from '@/components/common/ColorSchemeToggle';
import { Logo } from '@/components/common/Logo';

interface NavItem {
  to: '/' | '/students' | '/lessons' | '/instructors' | '/skills';
  label: string;
  icon: Icon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: IconLayoutDashboard, exact: true },
  { to: '/lessons', label: 'Lessons', icon: IconCalendarEvent },
  { to: '/students', label: 'Students', icon: IconUsers },
  { to: '/instructors', label: 'Instructors', icon: IconSchool },
  { to: '/skills', label: 'IKO progression', icon: IconListTree },
];

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header className="glass">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Logo />
          </Group>
          <Group gap="xs">
            <Button
              component={Link}
              to="/lessons/new"
              variant="gradient"
              size="xs"
              leftSection={<IconPlus size={16} />}
              visibleFrom="xs"
            >
              Log lesson
            </Button>
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <AppShell.Section grow component={ScrollArea}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.label}
              leftSection={<item.icon size={20} />}
              active={isActive(pathname, item)}
              onClick={close}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
              mb={4}
            />
          ))}
        </AppShell.Section>
        <AppShell.Section>
          <Text fz="xs" c="dimmed" px="sm">
            Unauthenticated access (temporary)
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
