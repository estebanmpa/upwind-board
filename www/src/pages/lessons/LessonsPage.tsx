import { useState } from 'react';
import { Button, Card, Group, SegmentedControl, Select } from '@mantine/core';
import { IconPlus, IconSchool } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import { LessonsTable } from '@/components/lessons/LessonsTable';
import { instructorsQuery } from '@/queries/instructors';
import { lessonsQuery } from '@/queries/lessons';
import type { LessonFilters } from '@/types/lesson';
import { fullName } from '@/utils/format';

const PAGE_SIZE = 15;
const UNASSIGNED = 'unassigned';

type View = 'upcoming' | 'past';

const VIEWS: { value: View; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

const EMPTY_STATES: Record<View, { title: string; description: string }> = {
  upcoming: {
    title: 'No upcoming lessons',
    description: 'Lessons you schedule will show up here.',
  },
  past: { title: 'No lessons', description: 'Lessons you log will show up here.' },
};

/** Upcoming lessons read soonest first; past ones, newest first. */
function viewFilters(view: View, now: string): LessonFilters {
  return view === 'upcoming' ? { from: now, order: 'asc' } : { to: now };
}

export function LessonsPage() {
  // Fixed while the page is open so the query key stays stable.
  const [now] = useState(() => new Date().toISOString());
  const [view, setView] = useState<View>('upcoming');
  const [page, setPage] = useState(1);
  const [instructor, setInstructor] = useState<string | null>(null);
  const { data, isPending } = useQuery(
    lessonsQuery({
      ...viewFilters(view, now),
      instructorId: instructor && instructor !== UNASSIGNED ? instructor : undefined,
      unassigned: instructor === UNASSIGNED || undefined,
      page,
      limit: PAGE_SIZE,
    }),
  );
  const { data: instructors } = useQuery(instructorsQuery({ limit: 100 }));
  const instructorOptions = [
    { value: UNASSIGNED, label: 'No instructor yet' },
    ...(instructors?.items ?? []).map((item) => ({
      value: item.id,
      label: fullName(item),
    })),
  ];

  return (
    <>
      <PageHeader
        title="Lessons"
        description="Schedule upcoming lessons and review the ones already given"
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
        <Group mb="md">
          <SegmentedControl
            data={VIEWS}
            value={view}
            onChange={(value) => {
              setView(value as View);
              setPage(1);
            }}
            radius="xl"
          />
          <Select
            placeholder="All instructors"
            leftSection={<IconSchool size={16} />}
            data={instructorOptions}
            value={instructor}
            onChange={(value) => {
              setInstructor(value);
              setPage(1);
            }}
            searchable
            clearable
            w={{ base: '100%', sm: 300 }}
          />
        </Group>
        {!isPending && data?.items.length === 0 ? (
          <EmptyState
            {...EMPTY_STATES[view]}
            action={
              <Button component={Link} to="/lessons/new" mt="md">
                New lesson
              </Button>
            }
          />
        ) : (
          <>
            <LessonsTable lessons={data?.items ?? []} />
            {data && (
              <PaginationFooter
                page={page}
                limit={PAGE_SIZE}
                total={data.total}
                onChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </>
  );
}
