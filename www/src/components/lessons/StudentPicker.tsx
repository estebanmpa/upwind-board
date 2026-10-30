import { useState } from 'react';
import { Select } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconUserPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { QuickStudentModal } from '@/components/students/QuickStudentModal';
import { studentsQuery } from '@/queries/students';
import type { PersonSummary } from '@/types/api';
import { fullName } from '@/utils/format';

/** Option value that opens the quick creation form instead of picking. */
const CREATE_OPTION = '__create__';

interface StudentPickerProps {
  excludedIds: string[];
  onPick: (student: PersonSummary) => void;
}

/** Server-side search to add students to a lesson, creating them if needed. */
export function StudentPicker({ excludedIds, onPick }: StudentPickerProps) {
  const [search, setSearch] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [creating, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);
  const { data, isFetching } = useQuery(
    studentsQuery({ search: debouncedSearch, limit: 20 }),
  );

  const students = (data?.items ?? []).filter(
    (student) => !excludedIds.includes(student.id),
  );
  const options = [
    ...students.map((student) => ({
      value: student.id,
      label: fullName(student),
    })),
    {
      value: CREATE_OPTION,
      label: search.trim() ? `Create student "${search.trim()}"` : 'Create a new student',
    },
  ];

  function pick(id: string | null) {
    if (id === CREATE_OPTION) {
      setNewStudentName(search);
      setSearch('');
      openCreate();
      return;
    }
    const student = students.find((candidate) => candidate.id === id);
    if (!student) return;
    onPick(student);
    setSearch('');
  }

  return (
    <>
      <Select
        placeholder="Search a student by name to add them"
        leftSection={<IconUserPlus size={18} />}
        data={options}
        value={null}
        onChange={pick}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        filter={({ options: all }) => all}
        nothingFoundMessage={isFetching ? 'Searching…' : 'No students with that name'}
        aria-label="Add student"
      />
      <QuickStudentModal
        opened={creating}
        initialName={newStudentName}
        onClose={closeCreate}
        onCreated={(student) => {
          closeCreate();
          onPick(student);
        }}
      />
    </>
  );
}
