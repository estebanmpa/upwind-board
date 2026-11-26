import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { HashService } from '../../domain/services/hash.service.js';

@Injectable()
export class CryptoHashService extends HashService {
  randomBytes(): string {
    return randomBytes(32).toString('hex');
  }
}
