import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/common/PageHeader';
import { ScheduleLessonCard } from '@/components/lessons/ScheduleLessonCard';
import { lessonsQuery } from '@/queries/lessons';
import {
  dayKey,
  formatWeekRange,
  groupByDay,
  startOfWeek,
  weekDays,
} from '@/utils/schedule';

// The API caps pages at 100: plenty for a week of lessons.
const WEEK_LESSONS_LIMIT = 100;

export function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const { data, isPending } = useQuery(
    lessonsQuery({
      from: weekStart.toISOString(),
      to: weekStart.add(1, 'week').toISOString(),
      order: 'asc',
      limit: WEEK_LESSONS_LIMIT,
    }),
  );
  const byDay = groupByDay(data?.items ?? []);
  const today = dayKey(dayjs());
  const isCurrentWeek = weekStart.isSame(startOfWeek());

  return (
    <>
      <PageHeader
        title="Schedule"
        description="Lessons booked for the week, day by day"
        actions={
          <Button
            component={Link}
            to="/lessons/new"
            variant="gradient"
            leftSection={<IconPlus size={18} />}
          >
            New lesson
          </Button>
        }
      />
      <Card withBorder padding="lg" className="fade-in-up">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <ActionIcon
              variant="default"
              size="lg"
              aria-label="Previous week"
              onClick={() => setWeekStart((week) => week.subtract(1, 'week'))}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <Button
              variant="default"
              disabled={isCurrentWeek}
              onClick={() => setWeekStart(startOfWeek())}
            >
              This week
            </Button>
            <ActionIcon
              variant="default"
              size="lg"
              aria-label="Next week"
              onClick={() => setWeekStart((week) => week.add(1, 'week'))}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
          <Group gap="sm">
            {isPending && <Loader size="xs" />}
            <Title order={4}>{formatWeekRange(weekStart)}</Title>
            {data && (
              <Text c="dimmed" fz="sm">
                · {data.total} {data.total === 1 ? 'lesson' : 'lessons'}
              </Text>
            )}
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4, xl: 7 }} spacing="sm">
          {weekDays(weekStart).map((day) => {
            const key = dayKey(day);
            const lessons = byDay.get(key) ?? [];
            const isToday = key === today;
            return (
              <Card
                key={key}
                withBorder
                padding="sm"
                radius="md"
                className="glass"
                style={
                  isToday
                    ? { borderColor: 'var(--mantine-color-brand-5)', borderWidth: 2 }
                    : undefined
                }
              >
                <Group justify="space-between" mb="sm">
                  <div>
                    <Text fz="xs" tt="uppercase" fw={700} c={isToday ? 'brand' : 'dimmed'}>
                      {day.format('ddd')}
                    </Text>
                    <Text fz="lg" fw={700} lh={1.1}>
                      {day.format('D MMM')}
                    </Text>
                  </div>
                  {isToday && (
                    <Text fz="xs" fw={600} c="brand">
                      Today
                    </Text>
                  )}
                </Group>
                <Stack gap="xs">
                  {lessons.length === 0 ? (
                    <Text fz="sm" c="dimmed">
                      No lessons
                    </Text>
                  ) : (
                    lessons.map((lesson) => (
                      <ScheduleLessonCard key={lesson.id} lesson={lesson} />
                    ))
                  )}
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </Card>
    </>
  );
}
