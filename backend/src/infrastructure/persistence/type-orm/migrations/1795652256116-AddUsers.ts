import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsers1795652256116 implements MigrationInterface {
  name = 'AddUsers1795652256116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "iam_id" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "name" character varying(200) NOT NULL, CONSTRAINT "uq_users_iam_id" UNIQUE ("iam_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
