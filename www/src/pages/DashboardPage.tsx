import { Button, Card, Grid, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  IconCalendarEvent,
  IconClockHour4,
  IconPlus,
  IconSchool,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { LessonsTable } from '@/components/lessons/LessonsTable';
import { instructorsQuery } from '@/queries/instructors';
import { lessonsQuery } from '@/queries/lessons';
import { studentsQuery } from '@/queries/students';
import { formatHours } from '@/utils/format';

const RECENT_LESSONS = 6;
// The API caps pages at 100: enough to add up a month of lessons.
const MONTH_LESSONS_LIMIT = 100;

function useMonthStats() {
  const from = dayjs().startOf('month').toISOString();
  const { data } = useQuery(lessonsQuery({ from, limit: MONTH_LESSONS_LIMIT }));
  const minutes = data?.items.reduce(
    (total, lesson) => total + lesson.durationMinutes,
    0,
  );
  return {
    lessons: data?.total,
    hours: minutes === undefined ? undefined : minutes / 60,
  };
}

export function DashboardPage() {
  const { data: students } = useQuery(studentsQuery({ limit: 1 }));
  const { data: instructors } = useQuery(instructorsQuery({ active: true, limit: 1 }));
  const { data: recent, isPending } = useQuery(lessonsQuery({ limit: RECENT_LESSONS }));
  const month = useMonthStats();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`School activity · ${dayjs().format('MMMM YYYY')}`}
      />
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} mb="xl" className="fade-in-up">
        <StatCard
          label="Lessons this month"
          value={month.lessons ?? '—'}
          icon={IconCalendarEvent}
          color="brand"
        />
        <StatCard
          label="Hours this month"
          value={month.hours === undefined ? '—' : formatHours(month.hours)}
          icon={IconClockHour4}
          color="teal"
        />
        <StatCard
          label="Students"
          value={students?.total ?? '—'}
          icon={IconUsers}
          color="cyan"
        />
        <StatCard
          label="Active instructors"
          value={instructors?.total ?? '—'}
          icon={IconSchool}
          color="indigo"
        />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card withBorder padding="lg" h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Latest lessons</Title>
              <Button variant="subtle" size="xs" component={Link} to="/lessons">
                View all
              </Button>
            </Group>
            {!isPending && recent?.items.length === 0 ? (
              <EmptyState
                title="No lessons yet"
                description="Log the first lesson to start tracking progression."
              />
            ) : (
              <LessonsTable lessons={recent?.items ?? []} />
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder padding="lg" h="100%" className="gradient-surface">
            <Stack justify="space-between" h="100%">
              <div>
                <Title order={3} c="white">
                  Just finished a lesson?
                </Title>
                <Text c="white" opacity={0.85} mt="xs">
                  Log it with its students and what each one worked on. The IKO
                  progression updates itself.
                </Text>
              </div>
              <Stack gap="xs">
                <Button
                  component={Link}
                  to="/lessons/new"
                  variant="white"
                  leftSection={<IconPlus size={18} />}
                >
                  Log lesson
                </Button>
                <Button
                  component={Link}
                  to="/students/new"
                  variant="outline"
                  color="white"
                  leftSection={<IconUserPlus size={18} />}
                >
                  New student
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}
