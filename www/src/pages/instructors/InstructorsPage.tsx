import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  SegmentedControl,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import { PersonAvatar } from '@/components/common/PersonAvatar';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { usePagedSearch } from '@/hooks/usePagedSearch';
import { useDeleteInstructor } from '@/mutations/instructors';
import { instructorsQuery } from '@/queries/instructors';
import type { Instructor } from '@/types/instructor';
import { fullName } from '@/utils/format';

const PAGE_SIZE = 15;

type ActiveFilter = 'active' | 'all';

function InstructorRow({
  instructor,
  onDelete,
}: {
  instructor: Instructor;
  onDelete: () => void;
}) {
  return (
    <Table.Tr>
      <Table.Td>
        <Group wrap="nowrap">
          <PersonAvatar person={instructor} radius="xl" />
          <div>
            <Text fw={600} fz="sm">
              {fullName(instructor)}
            </Text>
            <Text fz="xs" c="dimmed">
              {instructor.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>{instructor.phone}</Table.Td>
      <Table.Td>
        {instructor.ikoInstructorId ? (
          <Badge variant="light">IKO {instructor.ikoInstructorId}</Badge>
        ) : (
          <Text c="dimmed">—</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge variant="dot" color={instructor.active ? 'teal' : 'gray'}>
          {instructor.active ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="end" wrap="nowrap">
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              renderRoot={(props) => (
                <Link
                  {...props}
                  to="/instructors/$instructorId"
                  params={{ instructorId: instructor.id }}
                />
              )}
              aria-label="Edit"
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={onDelete}
              aria-label="Delete"
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export function InstructorsPage() {
  const { search, setSearch, debouncedSearch, page, setPage } = usePagedSearch();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');
  const { data, isPending } = useQuery(
    instructorsQuery({
      search: debouncedSearch,
      active: activeFilter === 'active' ? true : undefined,
      page,
      limit: PAGE_SIZE,
    }),
  );
  const confirmDelete = useConfirmDelete(useDeleteInstructor());

  return (
    <>
      <PageHeader
        title="Instructors"
        description="School team"
        actions={
          <Button
            component={Link}
            to="/instructors/new"
            leftSection={<IconPlus size={18} />}
          >
            New instructor
          </Button>
        }
      />
      <Card withBorder padding="lg" className="fade-in-up">
        <Group mb="md">
          <TextInput
            placeholder="Search by first or last name"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <SegmentedControl
            radius="xl"
            value={activeFilter}
            onChange={(value) => {
              setActiveFilter(value as ActiveFilter);
              setPage(1);
            }}
            data={[
              { value: 'active', label: 'Active' },
              { value: 'all', label: 'All' },
            ]}
          />
        </Group>
        {!isPending && data?.items.length === 0 ? (
          <EmptyState title="No instructors" description="No instructors match." />
        ) : (
          <>
            <Table.ScrollContainer minWidth={680}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Instructor</Table.Th>
                    <Table.Th>Phone</Table.Th>
                    <Table.Th>Certification</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data?.items.map((instructor) => (
                    <InstructorRow
                      key={instructor.id}
                      instructor={instructor}
                      onDelete={() =>
                        confirmDelete(instructor.id, {
                          title: 'Delete instructor',
                          message: `Are you sure you want to delete ${fullName(instructor)}? If they have lessons, deactivate them instead.`,
                          successMessage: 'Instructor deleted',
                        })
                      }
                    />
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
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
