import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  type AppVersion,
  GetAppVersionUseCase,
} from '../../../application/use-cases/version/get-app-version.use-case.js';

@ApiTags('version')
@Controller('version')
export class VersionController {
  constructor(private readonly getAppVersion: GetAppVersionUseCase) {}

  @Get()
  getVersion(): AppVersion {
    return this.getAppVersion.execute();
  }
}
