import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Center, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useAuth } from '../auth';
import {
  afterStateMismatch,
  consumeState,
  resolveCallback,
  type CallbackSearch,
} from '../callback';
import { Security } from '../security';

interface CallbackPageProps {
  search: CallbackSearch;
  onAuthenticated: () => void;
  onBackToLogin: () => void;
}

/** Landing page of the IAM redirect: validates the state and opens the session. */
export function CallbackPage({
  search,
  onAuthenticated,
  onBackToLogin,
}: CallbackPageProps) {
  const { completeLogin, isAuthenticated } = useAuth();
  // Read once: a successful exchange must not turn into a mismatch afterwards.
  const [outcome] = useState(() => resolveCallback(search, Security.get('state')));
  const [exchangeError, setExchangeError] = useState<string>();
  const started = useRef(false); // StrictMode runs effects twice
  // Set once this page's code was exchanged. The stored user alone is not
  // enough: it can belong to a session the server already ended.
  const [isExchanged, setIsExchanged] = useState(false);

  // Read once (above), so consuming it here cannot turn this page into a mismatch.
  useEffect(() => consumeState(search.state, Security), [search.state]);

  const mismatchAction =
    outcome.kind === 'state-mismatch' ? afterStateMismatch(isAuthenticated) : undefined;

  useEffect(() => {
    if (mismatchAction === 'continue') onAuthenticated();
  }, [mismatchAction, onAuthenticated]);

  useEffect(() => {
    if (isExchanged && isAuthenticated) {
      onAuthenticated();
      return;
    }
    if (outcome.kind !== 'exchange' || started.current) return;
    started.current = true;
    // Navigation waits for isAuthenticated (above) so the router sees the session.
    completeLogin(outcome.code)
      .then(() => setIsExchanged(true))
      .catch((error: Error) => setExchangeError(error.message));
  }, [outcome, isExchanged, isAuthenticated, completeLogin, onAuthenticated]);

  if (mismatchAction === 'show-error') {
    return (
      <CallbackProblem title="Security check failed" onBack={onBackToLogin}>
        The sign-in response does not match the request made from this browser. Please
        sign in again.
      </CallbackProblem>
    );
  }

  const errorMessage = outcome.kind === 'error' ? outcome.message : exchangeError;
  if (errorMessage) {
    return (
      <CallbackProblem title="Sign-in failed" onBack={onBackToLogin}>
        {errorMessage}
      </CallbackProblem>
    );
  }

  return (
    <Center pos="fixed" inset={0} role="status" aria-live="polite">
      <Stack align="center" gap="xs">
        <Loader />
        <Text size="sm" c="dimmed">
          Signing in…
        </Text>
      </Stack>
    </Center>
  );
}

function CallbackProblem({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <Center mih="100vh" p="md">
      <Paper className="glass" radius="lg" p="xl" maw={440} w="100%">
        <Stack align="center" ta="center">
          <IconAlertTriangle size={40} color="var(--mantine-color-red-6)" />
          <Title order={3}>{title}</Title>
          <Text c="dimmed">{children}</Text>
          <Button variant="light" onClick={onBack}>
            Back to sign in
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
