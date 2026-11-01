import { queryOptions } from '@tanstack/react-query';
import { fetchSkillTree } from '@/api/skills-api';
import { queryKeys } from './query-keys';

export const skillTreeQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: queryKeys.skills.tree(includeInactive),
    queryFn: () => fetchSkillTree(includeInactive),
    staleTime: 5 * 60_000,
  });
