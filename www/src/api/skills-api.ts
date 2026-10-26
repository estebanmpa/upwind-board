import type { Skill, SkillInput, SkillTreeNode } from '@/types/skill';
import { request } from './http';

export const fetchSkillTree = (includeInactive = false) =>
  request<SkillTreeNode[]>('/skills/tree', { query: { includeInactive } });

export const createSkill = (input: SkillInput) =>
  request<Skill>('/skills', { method: 'POST', body: input });

export const updateSkill = (id: string, input: Partial<SkillInput>) =>
  request<Skill>(`/skills/${id}`, { method: 'PATCH', body: input });

export const deleteSkill = (id: string) =>
  request<void>(`/skills/${id}`, { method: 'DELETE' });
