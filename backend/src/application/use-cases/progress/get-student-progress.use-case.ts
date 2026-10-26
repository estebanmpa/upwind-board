import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/domain.error.js';
import { LessonRepository } from '../../../domain/repositories/lesson.repository.js';
import { SkillRepository } from '../../../domain/repositories/skill.repository.js';
import { StudentRepository } from '../../../domain/repositories/student.repository.js';
import { StudentProgressDto } from '../../dtos/progress/student-progress.dto.js';
import {
  addSummaries,
  buildProgressTree,
  currentStatusBySkill,
  emptySummary,
} from '../../services/progression.calculator.js';
import { buildSkillTree } from '../../services/skill-tree.builder.js';

@Injectable()
export class GetStudentProgressUseCase {
  constructor(
    private readonly students: StudentRepository,
    private readonly skills: SkillRepository,
    private readonly lessons: LessonRepository,
  ) {}

  async execute(studentId: string): Promise<StudentProgressDto> {
    if (!(await this.students.findById(studentId))) {
      throw new NotFoundError('Student', studentId);
    }

    const [treeEntries, history, stats] = await Promise.all([
      // Inactive skills are pruned later unless the student worked on them.
      this.skills.findTree({ includeInactive: true }),
      this.lessons.findSkillRecordHistory(studentId),
      this.lessons.getStudentStats(studentId),
    ]);

    const tree = buildProgressTree(
      buildSkillTree(treeEntries),
      currentStatusBySkill(history),
    );

    return {
      studentId,
      totalLessons: stats.totalLessons,
      totalMinutes: stats.totalMinutes,
      totalHours: Math.round((stats.totalMinutes / 60) * 100) / 100,
      summary: tree.reduce(
        (acc, node) => addSummaries(acc, node.summary),
        emptySummary(),
      ),
      tree,
    };
  }
}
