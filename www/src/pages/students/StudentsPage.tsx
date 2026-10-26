import {
  ActionIcon,
  Button,
  Card,
  Group,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import { PersonAvatar } from '@/components/common/PersonAvatar';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { usePagedSearch } from '@/hooks/usePagedSearch';
import { useDeleteStudent } from '@/mutations/students';
import { studentsQuery } from '@/queries/students';
import type { Student } from '@/types/student';
import { calculateAge, fullName } from '@/utils/format';

const PAGE_SIZE = 15;

function StudentRow({ student, onDelete }: { student: Student; onDelete: () => void }) {
  const navigate = useNavigate();
  const goToProfile = () =>
    navigate({ to: '/students/$studentId', params: { studentId: student.id } });
  return (
    <Table.Tr className="clickable-row" onClick={goToProfile}>
      <Table.Td>
        <Group wrap="nowrap">
          <PersonAvatar person={student} radius="xl" />
          <div>
            <Text fw={600} fz="sm">
              {fullName(student)}
            </Text>
            <Text fz="xs" c="dimmed">
              {student.email ?? 'No email'}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>{student.phone}</Table.Td>
      <Table.Td>
        {student.birthDate ? `${calculateAge(student.birthDate)} years` : '—'}
      </Table.Td>
      <Table.Td>{student.weightKg ? `${student.weightKg} kg` : '—'}</Table.Td>
      <Table.Td onClick={(event) => event.stopPropagation()}>
        <Group gap={4} justify="end" wrap="nowrap">
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              renderRoot={(props) => (
                <Link
                  {...props}
                  to="/students/$studentId/edit"
                  params={{ studentId: student.id }}
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

export function StudentsPage() {
  const { search, setSearch, debouncedSearch, page, setPage } = usePagedSearch();
  const { data, isPending } = useQuery(
    studentsQuery({ search: debouncedSearch, page, limit: PAGE_SIZE }),
  );
  const confirmDelete = useConfirmDelete(useDeleteStudent());

  return (
    <>
      <PageHeader
        title="Students"
        description="Details and progression of every student"
        actions={
          <Button
            component={Link}
            to="/students/new"
            leftSection={<IconPlus size={18} />}
          >
            New student
          </Button>
        }
      />
      <Card withBorder padding="lg" className="fade-in-up">
        <TextInput
          placeholder="Search by first or last name"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          mb="md"
        />
        {!isPending && data?.items.length === 0 ? (
          <EmptyState
            title={debouncedSearch ? 'No results' : 'No students yet'}
            description={
              debouncedSearch
                ? 'No students with that name.'
                : 'Create the first one to get started.'
            }
          />
        ) : (
          <>
            <Table.ScrollContainer minWidth={680}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Phone</Table.Th>
                    <Table.Th>Age</Table.Th>
                    <Table.Th>Weight</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data?.items.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      onDelete={() =>
                        confirmDelete(student.id, {
                          title: 'Delete student',
                          message: `Are you sure you want to delete ${fullName(student)}? Only possible if they have no lessons.`,
                          successMessage: 'Student deleted',
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
