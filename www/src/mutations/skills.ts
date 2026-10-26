import { useMutation } from '@tanstack/react-query';
import { createSkill, deleteSkill, updateSkill } from '@/api/skills-api';
import { queryKeys } from '@/queries/query-keys';
import type { SkillInput } from '@/types/skill';
import { useInvalidate } from './invalidate';

// Progress trees are built from the skill tree.
const useInvalidateSkills = () =>
  useInvalidate(queryKeys.skills.all, queryKeys.students.all);

export function useCreateSkill() {
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: (input: SkillInput) => createSkill(input),
    onSuccess: invalidate,
  });
}

export function useUpdateSkill() {
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SkillInput> }) =>
      updateSkill(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSkill() {
  const invalidate = useInvalidateSkills();
  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: invalidate,
  });
}
