import { useState } from 'react';
import { Button, Card, Group, Select } from '@mantine/core';
import { IconPlus, IconSchool } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import { LessonsTable } from '@/components/lessons/LessonsTable';
import { instructorsQuery } from '@/queries/instructors';
import { lessonsQuery } from '@/queries/lessons';
import { fullName } from '@/utils/format';

const PAGE_SIZE = 15;

export function LessonsPage() {
  const [page, setPage] = useState(1);
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const { data, isPending } = useQuery(
    lessonsQuery({ instructorId: instructorId ?? undefined, page, limit: PAGE_SIZE }),
  );
  const { data: instructors } = useQuery(instructorsQuery({ limit: 100 }));
  const instructorOptions = (instructors?.items ?? []).map((instructor) => ({
    value: instructor.id,
    label: fullName(instructor),
  }));

  return (
    <>
      <PageHeader
        title="Lessons"
        description="Every logged lesson, from newest to oldest"
        actions={
          <Button
            component={Link}
            to="/lessons/new"
            variant="gradient"
            leftSection={<IconPlus size={18} />}
          >
            Log lesson
          </Button>
        }
      />
      <Card withBorder padding="lg" className="fade-in-up">
        <Group mb="md">
          <Select
            placeholder="All instructors"
            leftSection={<IconSchool size={16} />}
            data={instructorOptions}
            value={instructorId}
            onChange={(value) => {
              setInstructorId(value);
              setPage(1);
            }}
            searchable
            clearable
            w={{ base: '100%', sm: 300 }}
          />
        </Group>
        {!isPending && data?.items.length === 0 ? (
          <EmptyState
            title="No lessons"
            description="Lessons you log will show up here."
            action={
              <Button component={Link} to="/lessons/new" mt="md">
                Log lesson
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
