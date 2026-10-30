import { ApiProperty } from '@nestjs/swagger';
import { SkillStatus } from '../../../domain/entities/skill-status.enum.js';

export class HistoryInstructorDto {
  id: string;
  firstName: string;
  lastName: string;
}

export class HistorySkillRecordDto {
  id: string;
  skillId: string;
  skillCode: string;
  skillName: string;
  @ApiProperty({ enum: SkillStatus })
  status: SkillStatus;
  notes: string | null;
}

export class StudentLessonHistoryItemDto {
  lessonId: string;
  startsAt: Date;
  durationMinutes: number;
  spot: string;
  windDirection: string | null;
  windMinKnots: number | null;
  windMaxKnots: number | null;
  /** Notes about the lesson as a whole. */
  lessonNotes: string | null;
  /** Null while a scheduled lesson has no instructor. */
  @ApiProperty({ type: () => HistoryInstructorDto, nullable: true })
  instructor: HistoryInstructorDto | null;
  kiteSizeM2: number | null;
  board: string | null;
  /** Notes about this student in the lesson. */
  studentNotes: string | null;
  @ApiProperty({ type: () => [HistorySkillRecordDto] })
  skillRecords: HistorySkillRecordDto[];
}

export class StudentLessonHistoryPageDto {
  @ApiProperty({ type: () => [StudentLessonHistoryItemDto] })
  items: StudentLessonHistoryItemDto[];
  total: number;
  page: number;
  limit: number;
}
