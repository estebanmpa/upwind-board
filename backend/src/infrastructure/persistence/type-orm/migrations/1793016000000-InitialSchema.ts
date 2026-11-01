import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1793016000000 implements MigrationInterface {
  name = 'InitialSchema1793016000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "instructors" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(50) NOT NULL, "iko_instructor_id" character varying(50), "active" boolean NOT NULL DEFAULT true, CONSTRAINT "uq_instructors_email" UNIQUE ("email"), CONSTRAINT "PK_95e3da69ca76176ea4ab8435098" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "instructor_id" uuid, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "duration_minutes" integer NOT NULL, "spot" character varying(200) NOT NULL, "wind_direction" character varying(3), "wind_min_knots" integer, "wind_max_knots" integer, "notes" text, CONSTRAINT "chk_lessons_wind_range" CHECK ("wind_min_knots" IS NULL OR "wind_max_knots" IS NULL OR "wind_min_knots" <= "wind_max_knots"), CONSTRAINT "chk_lessons_duration_minutes_positive" CHECK ("duration_minutes" > 0), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_lessons_instructor_id" ON "lessons"  ("instructor_id") `);
        await queryRunner.query(`CREATE INDEX "idx_lessons_starts_at" ON "lessons"  ("starts_at") `);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(50), "birth_date" date, "weight_kg" numeric(5,2), "emergency_contact_name" character varying(200), "emergency_contact_phone" character varying(50), "notes" text, CONSTRAINT "chk_students_weight_kg_positive" CHECK ("weight_kg" > 0), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_students_last_name_first_name" ON "students"  ("last_name", "first_name") `);
        await queryRunner.query(`CREATE TABLE "lesson_students" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lesson_id" uuid NOT NULL, "student_id" uuid NOT NULL, "kite_size_m2" numeric(4,1), "board" character varying(100), "notes" text, CONSTRAINT "uq_lesson_students_lesson_id_student_id" UNIQUE ("lesson_id", "student_id"), CONSTRAINT "chk_lesson_students_kite_size_positive" CHECK ("kite_size_m2" > 0), CONSTRAINT "PK_d33165e88bff951f7a4c98a9a35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_lesson_students_student_id" ON "lesson_students"  ("student_id") `);
        await queryRunner.query(`CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "parent_id" uuid, "code" character varying(100) NOT NULL, "name" character varying(200) NOT NULL, "description" text, "sort_order" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "uq_skills_code" UNIQUE ("code"), CONSTRAINT "chk_skills_not_own_parent" CHECK ("parent_id" IS NULL OR "parent_id" <> "id"), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_skills_parent_id" ON "skills"  ("parent_id") `);
        await queryRunner.query(`CREATE TABLE "lesson_skill_records" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lesson_student_id" uuid NOT NULL, "skill_id" uuid NOT NULL, "status" "public"."skill_status" NOT NULL, "notes" text, CONSTRAINT "uq_lesson_skill_records_lesson_student_id_skill_id" UNIQUE ("lesson_student_id", "skill_id"), CONSTRAINT "PK_8e8cd02f0842493bf1270492a08" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_lesson_skill_records_skill_id" ON "lesson_skill_records"  ("skill_id") `);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "fk_lessons_instructor_id" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_students" ADD CONSTRAINT "fk_lesson_students_lesson_id" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_students" ADD CONSTRAINT "fk_lesson_students_student_id" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skills" ADD CONSTRAINT "fk_skills_parent_id" FOREIGN KEY ("parent_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_skill_records" ADD CONSTRAINT "fk_lesson_skill_records_lesson_student_id" FOREIGN KEY ("lesson_student_id") REFERENCES "lesson_students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_skill_records" ADD CONSTRAINT "fk_lesson_skill_records_skill_id" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lesson_skill_records" DROP CONSTRAINT "fk_lesson_skill_records_skill_id"`);
        await queryRunner.query(`ALTER TABLE "lesson_skill_records" DROP CONSTRAINT "fk_lesson_skill_records_lesson_student_id"`);
        await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT "fk_skills_parent_id"`);
        await queryRunner.query(`ALTER TABLE "lesson_students" DROP CONSTRAINT "fk_lesson_students_student_id"`);
        await queryRunner.query(`ALTER TABLE "lesson_students" DROP CONSTRAINT "fk_lesson_students_lesson_id"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "fk_lessons_instructor_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lesson_skill_records_skill_id"`);
        await queryRunner.query(`DROP TABLE "lesson_skill_records"`);
        await queryRunner.query(`DROP INDEX "public"."idx_skills_parent_id"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lesson_students_student_id"`);
        await queryRunner.query(`DROP TABLE "lesson_students"`);
        await queryRunner.query(`DROP INDEX "public"."idx_students_last_name_first_name"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_starts_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_instructor_id"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
        await queryRunner.query(`DROP TABLE "instructors"`);
    }
}
