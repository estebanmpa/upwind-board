import { useQueryClient, type QueryKey } from '@tanstack/react-query';

export function useInvalidate(...keys: QueryKey[]) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}
