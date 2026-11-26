import { Module } from '@nestjs/common';
import { GetAppVersionUseCase } from '../../application/use-cases/version/get-app-version.use-case.js';
import { VersionController } from '../rest/controllers/version.controller.js';

@Module({
  controllers: [VersionController],
  providers: [GetAppVersionUseCase],
})
export class VersionModule {}
