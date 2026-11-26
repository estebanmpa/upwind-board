import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

const URL_OPTIONS = { require_tld: false, require_protocol: true };

export class EnvironmentVariables {
  /** `production` makes the session cookie Secure and SameSite=None. */
  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: 'development' | 'production' | 'test' = 'development';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  /** Comma-separated origins allowed to call the API; empty disables CORS. */
  @IsOptional()
  @IsString()
  CORS_ORIGINS: string = '';

  @IsOptional()
  @Transform(({ obj }) => [true, 'true'].includes(obj.DB_LOGGING))
  @IsBoolean()
  DB_LOGGING: boolean = false;

  /** Base URL the backend uses to reach the IAM (server to server). */
  @IsUrl(URL_OPTIONS)
  IAM_BASE_URL: string;

  /** OAuth client registered in the IAM; also this app's IAM resource. */
  @IsString()
  @IsNotEmpty()
  IAM_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  IAM_CLIENT_SECRET: string;

  /** Frontend page the IAM sends the user back to; registered in the IAM. */
  @IsUrl(URL_OPTIONS)
  IAM_CALLBACK_URL: string;

  /** Sessions, IAM discovery cache and session-renewal locks. */
  @IsUrl({ ...URL_OPTIONS, protocols: ['redis', 'rediss'] })
  REDIS_URL: string;
}

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return validated;
}
