import { createFileRoute } from '@tanstack/react-router';
import { SkillsPage } from '@/pages/skills/SkillsPage';

export const Route = createFileRoute('/_authenticated/skills')({
  component: SkillsPage,
});
