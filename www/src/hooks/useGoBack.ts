import {
  useCanGoBack,
  useNavigate,
  useRouter,
  type NavigateOptions,
} from '@tanstack/react-router';

/**
 * Returns to the previous page, wherever the user came from. Pages opened
 * directly (no in-app history) go to `fallback` instead.
 */
export function useGoBack(fallback: NavigateOptions) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  return () => (canGoBack ? router.history.back() : navigate(fallback));
}
