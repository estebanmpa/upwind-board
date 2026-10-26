import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './infrastructure/config/database.config.js';
import {
  EnvironmentVariables,
  validateEnv,
} from './infrastructure/config/env.validation.js';
import { InstructorsModule } from './infrastructure/modules/instructors.module.js';
import { StudentsModule } from './infrastructure/modules/students.module.js';
import { LessonsModule } from './infrastructure/modules/lessons.module.js';
import { ProgressModule } from './infrastructure/modules/progress.module.js';
import { SkillsModule } from './infrastructure/modules/skills.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        buildDataSourceOptions({
          DB_HOST: config.get('DB_HOST'),
          DB_PORT: config.get('DB_PORT'),
          DB_USERNAME: config.get('DB_USERNAME'),
          DB_PASSWORD: config.get('DB_PASSWORD'),
          DB_NAME: config.get('DB_NAME'),
          DB_LOGGING: config.get('DB_LOGGING'),
        }),
    }),
    InstructorsModule,
    StudentsModule,
    SkillsModule,
    LessonsModule,
    ProgressModule,
  ],
})
export class AppModule {}
