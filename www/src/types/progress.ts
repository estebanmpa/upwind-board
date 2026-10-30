import type { PersonSummary } from './api';
import type { SkillStatus } from './skill';
import type { WindDirection } from './wind';

export interface ProgressSummary {
  totalSkills: number;
  notStarted: number;
  introduced: number;
  practiced: number;
  mastered: number;
}

export interface SkillProgressNode {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  isLeaf: boolean;
  status: SkillStatus | null;
  lastLessonId: string | null;
  lastWorkedAt: string | null;
  summary: ProgressSummary;
  children: SkillProgressNode[];
}

export interface StudentProgress {
  studentId: string;
  totalLessons: number;
  totalMinutes: number;
  totalHours: number;
  summary: ProgressSummary;
  tree: SkillProgressNode[];
}

export interface StudentLessonHistoryItem {
  lessonId: string;
  startsAt: string;
  durationMinutes: number;
  spot: string;
  windDirection: WindDirection | null;
  windMinKnots: number | null;
  windMaxKnots: number | null;
  lessonNotes: string | null;
  instructor: PersonSummary | null;
  kiteSizeM2: number | null;
  board: string | null;
  studentNotes: string | null;
  skillRecords: {
    id: string;
    skillId: string;
    skillCode: string;
    skillName: string;
    status: SkillStatus;
    notes: string | null;
  }[];
}
