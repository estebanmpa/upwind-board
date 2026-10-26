import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  EnvironmentVariables,
  parseCorsOrigins,
} from './infrastructure/config/env.validation.js';
import { setupApp } from './infrastructure/rest/setup-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);
  setupApp(app);

  // In production the web app is served from its own domain.
  const origins = parseCorsOrigins(config.get('CORS_ORIGINS'));
  if (origins.length > 0) {
    app.enableCors({
      origin: origins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept'],
    });
  }

  app.enableShutdownHooks();
  await app.listen(config.get('PORT'), '0.0.0.0');
}
await bootstrap();
