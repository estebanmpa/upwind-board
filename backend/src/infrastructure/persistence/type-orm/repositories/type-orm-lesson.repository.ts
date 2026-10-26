import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import {
  Lesson,
  LessonDraft,
} from '../../../../domain/entities/lesson.entity.js';
import {
  LessonFilter,
  LessonRepository,
  SkillRecordHistoryEntry,
  StudentLessonStats,
} from '../../../../domain/repositories/lesson.repository.js';
import {
  Page,
  PageRequest,
} from '../../../../domain/repositories/pagination.js';
import { LessonSkillRecordOrmEntity } from '../entities/lesson-skill-record.orm-entity.js';
import { LessonStudentOrmEntity } from '../entities/lesson-student.orm-entity.js';
import { LessonOrmEntity } from '../entities/lesson.orm-entity.js';
import { LessonMapper } from '../mappers/lesson.mapper.js';

const AGGREGATE_RELATIONS = {
  instructor: true,
  students: { student: true, skillRecords: true },
} as const;

@Injectable()
export class TypeOrmLessonRepository extends LessonRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async findById(id: string): Promise<Lesson | null> {
    const entity = await this.dataSource
      .getRepository(LessonOrmEntity)
      .findOne({
        where: { id },
        relations: AGGREGATE_RELATIONS,
      });
    return entity ? LessonMapper.toDomain(entity) : null;
  }

  async findPage(
    filter: LessonFilter,
    { page, limit }: PageRequest,
  ): Promise<Page<Lesson>> {
    // Page over lesson ids first so joins cannot distort skip/take.
    const qb = this.dataSource
      .getRepository(LessonOrmEntity)
      .createQueryBuilder('lesson')
      .select(['lesson.id', 'lesson.startsAt']);
    if (filter.instructorId) {
      qb.andWhere('lesson.instructor_id = :instructorId', {
        instructorId: filter.instructorId,
      });
    }
    if (filter.studentId) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM lesson_students ls WHERE ls.lesson_id = lesson.id AND ls.student_id = :studentId)',
        { studentId: filter.studentId },
      );
    }
    if (filter.from) {
      qb.andWhere('lesson.starts_at >= :from', { from: filter.from });
    }
    if (filter.to) {
      qb.andWhere('lesson.starts_at < :to', { to: filter.to });
    }
    const [rows, total] = await qb
      .orderBy('lesson.starts_at', 'DESC')
      .addOrderBy('lesson.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const ids = rows.map((row) => row.id);
    const entities = ids.length
      ? await this.dataSource.getRepository(LessonOrmEntity).find({
          where: { id: In(ids) },
          relations: AGGREGATE_RELATIONS,
        })
      : [];
    const byId = new Map(entities.map((e) => [e.id, e]));
    return {
      items: ids.map((id) => LessonMapper.toDomain(byId.get(id)!)),
      total,
      page,
      limit,
    };
  }

  async save(draft: LessonDraft): Promise<Lesson> {
    const lessonId = await this.dataSource.transaction((manager) =>
      this.saveInTransaction(manager, draft),
    );
    return (await this.findById(lessonId))!;
  }

  private async saveInTransaction(
    manager: EntityManager,
    draft: LessonDraft,
  ): Promise<string> {
    const lesson = await manager.save(
      manager.create(LessonOrmEntity, {
        id: draft.id,
        instructorId: draft.instructorId,
        startsAt: draft.startsAt,
        durationMinutes: draft.durationMinutes,
        spot: draft.spot,
        windDirection: draft.windDirection,
        windMinKnots: draft.windMinKnots,
        windMaxKnots: draft.windMaxKnots,
        notes: draft.notes,
      }),
    );

    // Students (and, by cascade, their records) missing from the draft go away.
    await this.deleteMissing(
      manager,
      LessonStudentOrmEntity,
      'lesson_id',
      lesson.id,
      draft.students.flatMap((s) => (s.id ? [s.id] : [])),
    );

    for (const student of draft.students) {
      const row = await manager.save(
        manager.create(LessonStudentOrmEntity, {
          id: student.id,
          lessonId: lesson.id,
          studentId: student.studentId,
          kiteSizeM2: student.kiteSizeM2,
          board: student.board,
          notes: student.notes,
        }),
      );

      await this.deleteMissing(
        manager,
        LessonSkillRecordOrmEntity,
        'lesson_student_id',
        row.id,
        student.skillRecords.flatMap((r) => (r.id ? [r.id] : [])),
      );
      if (student.skillRecords.length > 0) {
        await manager.save(
          student.skillRecords.map((record) =>
            manager.create(LessonSkillRecordOrmEntity, {
              id: record.id,
              lessonStudentId: row.id,
              skillId: record.skillId,
              status: record.status,
              notes: record.notes,
            }),
          ),
        );
      }
    }
    return lesson.id;
  }

  private async deleteMissing(
    manager: EntityManager,
    entity: typeof LessonStudentOrmEntity | typeof LessonSkillRecordOrmEntity,
    parentColumn: string,
    parentId: string,
    keepIds: string[],
  ): Promise<void> {
    const qb = manager
      .createQueryBuilder()
      .delete()
      .from(entity)
      .where(`${parentColumn} = :parentId`, { parentId });
    if (keepIds.length > 0) {
      qb.andWhere('id NOT IN (:...keepIds)', { keepIds });
    }
    await qb.execute();
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(LessonOrmEntity).delete({ id });
  }

  async findSkillRecordHistory(
    studentId: string,
  ): Promise<SkillRecordHistoryEntry[]> {
    const rows: {
      skill_id: string;
      status: SkillRecordHistoryEntry['status'];
      lesson_id: string;
      starts_at: Date;
      updated_at: Date;
    }[] = await this.dataSource.query(
      `
      SELECT r.skill_id, r.status, l.id AS lesson_id, l.starts_at, r.updated_at
      FROM lesson_skill_records r
      JOIN lesson_students ls ON ls.id = r.lesson_student_id
      JOIN lessons l ON l.id = ls.lesson_id
      WHERE ls.student_id = $1
      ORDER BY l.starts_at, r.updated_at
    `,
      [studentId],
    );
    return rows.map((row) => ({
      skillId: row.skill_id,
      status: row.status,
      lessonId: row.lesson_id,
      lessonStartsAt: row.starts_at,
      recordedAt: row.updated_at,
    }));
  }

  async getStudentStats(studentId: string): Promise<StudentLessonStats> {
    const [row]: { total_lessons: string; total_minutes: string }[] =
      await this.dataSource.query(
        `
        SELECT COUNT(*) AS total_lessons,
               COALESCE(SUM(l.duration_minutes), 0) AS total_minutes
        FROM lessons l
        JOIN lesson_students ls ON ls.lesson_id = l.id
        WHERE ls.student_id = $1
      `,
        [studentId],
      );
    return {
      totalLessons: Number(row.total_lessons),
      totalMinutes: Number(row.total_minutes),
    };
  }
}
