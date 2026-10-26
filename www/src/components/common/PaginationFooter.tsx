import { Group, Pagination, Text } from '@mantine/core';

interface PaginationFooterProps {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}

export function PaginationFooter({
  page,
  limit,
  total,
  onChange,
}: PaginationFooterProps) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  return (
    <Group justify="space-between" mt="md">
      <Text fz="sm" c="dimmed">
        {first}–{last} of {total}
      </Text>
      {pages > 1 && <Pagination value={page} total={pages} onChange={onChange} />}
    </Group>
  );
}
