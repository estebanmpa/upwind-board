import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

/** Search box state debounced for the API, resetting to page 1 on change. */
export function usePagedSearch(delay = 300) {
  const [search, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebouncedValue(search.trim(), delay);

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  return { search, setSearch, debouncedSearch, page, setPage };
}
