import { describe, expect, it, vi } from 'vitest';
import type { EnvironmentService } from '../../../infrastructure/services/environment.service.js';
import { GetAppVersionUseCase } from './get-app-version.use-case.js';

describe('GetAppVersionUseCase', () => {
  it('returns the version and reads it only once', () => {
    const version = vi.fn(() => '1.2.3');
    const environment = {
      get version() {
        return version();
      },
    } as unknown as EnvironmentService;
    const useCase = new GetAppVersionUseCase(environment);

    expect(useCase.execute()).toEqual({ version: '1.2.3' });
    expect(useCase.execute()).toEqual({ version: '1.2.3' });
    expect(version).toHaveBeenCalledTimes(1);
  });
});
