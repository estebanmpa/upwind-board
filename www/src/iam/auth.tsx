import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isUnauthorizedError, UNAUTHORIZED_EVENT } from '@/api/http';
import {
  exchangeCode,
  fetchAuthorizationUrl,
  fetchUserInfo,
  requestLogout,
} from './auth-api';
import { Security } from './security';
import type { UserSession } from './types';

const SESSION_QUERY_KEY = ['iam', 'session'];
// The stored user only says a session once existed; the server is checked
// again after this long so an expired cookie is caught before rendering.
const SESSION_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export interface AuthContextType {
  payload: UserSession | null;
  isAuthenticated: boolean;
  isPending: boolean;
  logout: () => Promise<void>;
  redirectToIAM: () => void;
  completeLogin: (authCode: string) => Promise<UserSession>;
  /** Resolves null when the server no longer recognizes the session. */
  verifySession: () => Promise<UserSession | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

function readStoredUser(): UserSession | null {
  const user = Security.get('user');
  if (!user) return null;
  try {
    return JSON.parse(user) as UserSession;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [payload, setPayloadState] = useState<UserSession | null>(readStoredUser);
  // Mirrors payload for event handlers, which may run before a re-render.
  const payloadRef = useRef(payload);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isLoggingOut = useRef(false);
  const queryClient = useQueryClient();

  const setPayload = useCallback((session: UserSession | null) => {
    payloadRef.current = session;
    setPayloadState(session);
  }, []);

  // Only the user is removed: removing the state too would break a login
  // under way in another window of the app, which shares this storage.
  const endLocalSession = useCallback(() => {
    Security.remove('user');
    setPayload(null);
    // Nothing cached for this user may leak into the next session.
    queryClient.clear();
  }, [queryClient, setPayload]);

  const logoutMutation = useMutation({
    mutationFn: requestLogout,
    onSettled: () => {
      isLoggingOut.current = false;
      endLocalSession();
    },
  });

  const tokenExchangeMutation = useMutation({
    mutationFn: exchangeCode,
    onSuccess: (session) => {
      Security.set('user', JSON.stringify(session));
      queryClient.setQueryData(SESSION_QUERY_KEY, session);
      setPayload(session);
    },
  });

  const authorizeMutation = useMutation({
    mutationFn: fetchAuthorizationUrl,
    onSuccess: (url) => {
      setIsRedirecting(true);
      window.location.href = url;
    },
    onError: (error) =>
      notifications.show({
        color: 'red',
        title: 'Could not start the sign-in',
        message: error.message,
      }),
  });

  const { mutateAsync: logoutAsync } = logoutMutation;
  const { mutate: requestAuthorizationUrl } = authorizeMutation;
  const { mutateAsync: completeLogin } = tokenExchangeMutation;

  const logout = useCallback(async () => {
    // Several requests can fail at once; only the first one logs out.
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    // onSettled clears the local session either way.
    await logoutAsync().catch(() => undefined);
  }, [logoutAsync]);

  useEffect(() => {
    // The server already ended this session, so there is nothing to log out
    // there. Calling it anyway would send the cookie the browser holds now,
    // which may belong to a session just opened in another window.
    const handleUnauthorized = () => {
      if (!payloadRef.current || isLoggingOut.current) return;
      notifications.show({
        id: 'session-expired',
        color: 'yellow',
        title: 'Session expired',
        message: 'Please sign in again.',
      });
      endLocalSession();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [endLocalSession]);

  // Every window of the app shares the storage (on Android the installed app
  // shares Chrome's too): follow logins and logouts made in the others.
  useEffect(() => {
    const followOtherWindows = (event: StorageEvent) => {
      if (event.key !== Security.storageKey('user') && event.key !== null) return;
      const stored = readStoredUser();
      if (!stored) queryClient.clear();
      setPayload(stored);
    };
    window.addEventListener('storage', followOtherWindows);
    return () => window.removeEventListener('storage', followOtherWindows);
  }, [queryClient, setPayload]);

  // Going back from the IAM login restores this page from the bfcache with
  // the redirect still flagged, which would keep it loading forever.
  useEffect(() => {
    const resetRedirect = (event: PageTransitionEvent) => {
      if (event.persisted) setIsRedirecting(false);
    };
    window.addEventListener('pageshow', resetRedirect);
    return () => window.removeEventListener('pageshow', resetRedirect);
  }, []);

  const redirectToIAM = useCallback(() => {
    // A fresh state per attempt lets the callback detect forged responses (CSRF).
    const state = crypto.randomUUID();
    Security.set('state', state);
    requestAuthorizationUrl(state);
  }, [requestAuthorizationUrl]);

  const verifySession = useCallback(async () => {
    try {
      return await queryClient.fetchQuery({
        queryKey: SESSION_QUERY_KEY,
        queryFn: fetchUserInfo,
        staleTime: SESSION_CHECK_INTERVAL_MS,
      });
    } catch (error) {
      // The 401 itself triggers the central logout; other errors are real failures.
      if (isUnauthorizedError(error)) return null;
      throw error;
    }
  }, [queryClient]);

  const isPending =
    logoutMutation.isPending ||
    tokenExchangeMutation.isPending ||
    authorizeMutation.isPending ||
    isRedirecting;

  const value = useMemo<AuthContextType>(
    () => ({
      payload,
      isAuthenticated: !!payload,
      isPending,
      logout,
      redirectToIAM,
      completeLogin,
      verifySession,
    }),
    [payload, isPending, logout, redirectToIAM, completeLogin, verifySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
