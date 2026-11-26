import { request } from '@/api/http';
import type { UserSession } from './types';

/** IAM login URL; the browser must navigate there itself (SSO cookie). */
export const fetchAuthorizationUrl = (state: string) =>
  request<string>('/auth/authorize', {
    method: 'POST',
    body: { state, uiLocales: navigator.language || undefined },
  });

export const exchangeCode = (code: string) =>
  request<UserSession>('/auth/token', { method: 'POST', body: { code } });

export const fetchUserInfo = () =>
  request<UserSession>('/auth/userinfo', { method: 'POST' });

export const requestLogout = () => request<void>('/auth/logout', { method: 'POST' });
