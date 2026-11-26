import type { ReactNode } from 'react';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCalendarEvent,
  IconCalendarWeek,
  IconLayoutDashboard,
  IconListTree,
  IconLogout,
  IconPackage,
  IconPlus,
  IconSchool,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { ColorSchemeToggle } from '@/components/common/ColorSchemeToggle';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/iam';

interface NavItem {
  to:
    | '/'
    | '/schedule'
    | '/students'
    | '/lessons'
    | '/instructors'
    | '/inventory'
    | '/skills';
  label: string;
  icon: Icon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: IconLayoutDashboard, exact: true },
  { to: '/schedule', label: 'Schedule', icon: IconCalendarWeek },
  { to: '/lessons', label: 'Lessons', icon: IconCalendarEvent },
  { to: '/students', label: 'Students', icon: IconUsers },
  { to: '/instructors', label: 'Instructors', icon: IconSchool },
  { to: '/inventory', label: 'Inventory', icon: IconPackage },
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
              New lesson
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
          <UserCard />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

function UserCard() {
  const { payload, logout, isPending } = useAuth();
  const navigate = useNavigate();
  if (!payload) return null;

  const signOut = () => logout().then(() => navigate({ to: '/login' }));

  return (
    <Group
      gap="sm"
      wrap="nowrap"
      px="xs"
      py="xs"
      className="glass"
      style={{ borderRadius: 'var(--mantine-radius-md)' }}
    >
      <Avatar name={payload.displayName} color="initials" radius="xl" size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text fz="sm" fw={600} truncate>
          {payload.displayName}
        </Text>
        <Text fz="xs" c="dimmed" truncate>
          {payload.email}
        </Text>
      </div>
      <Tooltip label="Sign out">
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Sign out"
          loading={isPending}
          onClick={signOut}
        >
          <IconLogout size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
