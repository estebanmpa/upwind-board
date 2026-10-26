import { useState } from 'react';
import { Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconUserPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { studentsQuery } from '@/queries/students';
import type { PersonSummary } from '@/types/api';
import { fullName } from '@/utils/format';

interface StudentPickerProps {
  excludedIds: string[];
  onPick: (student: PersonSummary) => void;
}

/** Server-side search to add students to a lesson. */
export function StudentPicker({ excludedIds, onPick }: StudentPickerProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);
  const { data, isFetching } = useQuery(
    studentsQuery({ search: debouncedSearch, limit: 20 }),
  );

  const students = (data?.items ?? []).filter(
    (student) => !excludedIds.includes(student.id),
  );
  const options = students.map((student) => ({
    value: student.id,
    label: fullName(student),
  }));

  function pick(id: string | null) {
    const student = students.find((candidate) => candidate.id === id);
    if (!student) return;
    onPick(student);
    setSearch('');
  }

  return (
    <Select
      placeholder="Buscar alumno por nombre para agregarlo"
      leftSection={<IconUserPlus size={18} />}
      data={options}
      value={null}
      onChange={pick}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      filter={({ options: all }) => all}
      nothingFoundMessage={isFetching ? 'Buscando…' : 'No hay alumnos con ese nombre'}
      aria-label="Agregar alumno"
    />
  );
}
