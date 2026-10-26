import { MigrationInterface, QueryRunner } from 'typeorm';

/** Wind directions move from Spanish (O = oeste) to English initials. */
export class EnglishWindDirections1793016000002 implements MigrationInterface {
  name = 'EnglishWindDirections1793016000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "lessons" SET "wind_direction" = CASE "wind_direction"
        WHEN 'SSO' THEN 'SSW'
        WHEN 'SO' THEN 'SW'
        WHEN 'OSO' THEN 'WSW'
        WHEN 'O' THEN 'W'
        WHEN 'ONO' THEN 'WNW'
        WHEN 'NO' THEN 'NW'
        WHEN 'NNO' THEN 'NNW'
      END
      WHERE "wind_direction" IN ('SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "lessons" SET "wind_direction" = CASE "wind_direction"
        WHEN 'SSW' THEN 'SSO'
        WHEN 'SW' THEN 'SO'
        WHEN 'WSW' THEN 'OSO'
        WHEN 'W' THEN 'O'
        WHEN 'WNW' THEN 'ONO'
        WHEN 'NW' THEN 'NO'
        WHEN 'NNW' THEN 'NNO'
      END
      WHERE "wind_direction" IN ('SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW');
    `);
  }
}
