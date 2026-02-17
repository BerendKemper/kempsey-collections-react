import { useCallback, useEffect, useMemo, useState } from "react";

const AUTH_API_ORIGIN = import.meta.env.VITE_AUTH_API_ORIGIN;
const DEV_MOCK_SESSION_ENABLED =
  import.meta.env.DEV &&
  import.meta.env.VITE_DEV_MOCK_SESSION === `1`;
export const AUTH_SESSION_CHANGED_EVENT = `auth:session-changed`;

export type SessionState = {
  authenticated: boolean;
  userId?: string;
  roles?: string[];
  provider?: string;
  displayName?: string | null;
  email?: string;
};

type SessionResult = {
  session: SessionState | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<SessionState | null>;
};

const DEV_MOCK_SESSION: SessionState = {
  authenticated: true,
  userId: `dev-local-user`,
  roles: [`owner`, `admin`, `seller`],
  provider: `dev-mock`,
  displayName: `Dev Owner`,
  email: `dev-owner@local`,
};

export function useSession(): SessionResult {
  const [session, setSession] = useState<SessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionEndpoint = useMemo(() => `${AUTH_API_ORIGIN}/auth/session`, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (DEV_MOCK_SESSION_ENABLED) {
      setSession(DEV_MOCK_SESSION);
      setIsLoading(false);
      return DEV_MOCK_SESSION;
    }

    try {
      const response = await fetch(sessionEndpoint, {
        credentials: `include`,
      });

      if (!response.ok) {
        throw new Error(`Session check failed: ${response.status}`);
      }

      const data = (await response.json()) as SessionState;
      setSession(data);
      return data;
    } catch (caughtError) {
      console.error(`Failed to load session`, caughtError);
      setSession({ authenticated: false });
      setError(caughtError instanceof Error ? caughtError.message : `Unknown error`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionEndpoint]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const handleSessionChanged = () => {
      void refreshSession();
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);
  }, [refreshSession]);

  return {
    session,
    isLoading,
    error,
    refreshSession,
  };
}
