import { ApiProperty } from '@nestjs/swagger';
import { SkillStatus } from '../../../domain/entities/skill-status.enum.js';

export class ProgressSummaryDto {
  /** Leaves under this node (the node itself if it is a leaf). */
  totalSkills: number;
  notStarted: number;
  introduced: number;
  practiced: number;
  mastered: number;
}

export class SkillProgressNodeDto {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  isLeaf: boolean;

  /** Latest status for leaves, by lesson date; null if never worked or not a leaf. */
  @ApiProperty({ enum: SkillStatus, nullable: true })
  status: SkillStatus | null;

  /** Lesson where the current status was recorded. */
  lastLessonId: string | null;
  lastWorkedAt: Date | null;

  summary: ProgressSummaryDto;

  @ApiProperty({ type: () => [SkillProgressNodeDto] })
  children: SkillProgressNodeDto[];
}

export class StudentProgressDto {
  studentId: string;
  totalLessons: number;
  totalMinutes: number;
  /** totalMinutes / 60, rounded to 2 decimals. */
  totalHours: number;
  summary: ProgressSummaryDto;
  @ApiProperty({ type: () => [SkillProgressNodeDto] })
  tree: SkillProgressNodeDto[];
}
