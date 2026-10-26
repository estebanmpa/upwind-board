import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../src/app.module.js';
import { setupApp } from '../../../src/infrastructure/rest/setup-app.js';

export interface TestApp {
  app: INestApplication<App>;
  dataSource: DataSource;
  http: () => ReturnType<typeof request>;
}

export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  setupApp(app);
  await app.init();

  const dataSource = app.get<DataSource>(getDataSourceToken());
  await dataSource.runMigrations();

  return { app, dataSource, http: () => request(app.getHttpServer()) };
}

export async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    'TRUNCATE lesson_skill_records, lesson_students, lessons, students, instructors, skills CASCADE',
  );
}
