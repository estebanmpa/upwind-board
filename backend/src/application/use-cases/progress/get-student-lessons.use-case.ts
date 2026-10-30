import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { LessonRepository } from '../../../domain/repositories/lesson.repository.js';
import { PageRequest } from '../../../domain/repositories/pagination.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';
import { StudentLessonHistoryPageDto } from '../../dtos/progress/student-lesson-history.dto.js';

@Injectable()
export class GetStudentLessonsUseCase {
  constructor(
    private readonly students: StudentRepository,
    private readonly lessons: LessonRepository,
    private readonly skills: SkillRepository,
  ) {}

  /** The student's lessons, most recent first, with what they worked on. */
  async execute(
    studentId: string,
    request: PageRequest,
  ): Promise<StudentLessonHistoryPageDto> {
    if (!(await this.students.findById(studentId))) {
      throw new NotFoundError('Student', studentId);
    }

    const page = await this.lessons.findPage({ studentId }, request);
    const participations = page.items.map((lesson) => ({
      lesson,
      participation: lesson.students.find((s) => s.studentId === studentId)!,
    }));

    const skills = await this.skills.findByIds([
      ...new Set(
        participations.flatMap((p) =>
          p.participation.skillRecords.map((r) => r.skillId),
        ),
      ),
    ]);
    const skillById = new Map(skills.map((s) => [s.id, s]));

    return {
      total: page.total,
      page: page.page,
      limit: page.limit,
      items: participations.map(({ lesson, participation }) => ({
        lessonId: lesson.id,
        startsAt: lesson.startsAt,
        durationMinutes: lesson.durationMinutes,
        spot: lesson.spot,
        windDirection: lesson.windDirection,
        windMinKnots: lesson.windMinKnots,
        windMaxKnots: lesson.windMaxKnots,
        lessonNotes: lesson.notes,
        instructor: lesson.instructor,
        kiteSizeM2: participation.kiteSizeM2,
        board: participation.board,
        studentNotes: participation.notes,
        skillRecords: participation.skillRecords.map((record) => {
          const skill = skillById.get(record.skillId)!;
          return {
            id: record.id,
            skillId: record.skillId,
            skillCode: skill.code,
            skillName: skill.name,
            status: record.status,
            notes: record.notes,
          };
        }),
      })),
    };
  }
}
