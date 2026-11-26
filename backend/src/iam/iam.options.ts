import { Type } from '@nestjs/common';
import { UserSyncService } from './domain/services/user-sync.service.js';

export const IAM_OPTIONS = Symbol('IAM_OPTIONS');

export interface IamModuleOptions {
  userSyncService: Type<UserSyncService>;
  // Route prefixes the host app serves without a session (e.g. API docs).
  publicPathPrefixes?: string[];
  // Default OpenID Connect ui_locales for the IAM login (e.g. "en"),
  // used when the browser does not send the language it is showing.
  uiLocales?: string;
  // Prefix of the session cookie name, e.g. "upwind-board".
  cookiePrefix: string;
}
