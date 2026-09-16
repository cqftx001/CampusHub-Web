import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentAccount,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/authApi";
import {
  AUTH_EXPIRED_EVENT,
  restoreAccessToken,
} from "../api/apiClient";
import { accessTokenStore } from "./accessTokenStore";
import type {
  CurrentAccount,
  LoginRequest,
} from "../types/auth";

interface AuthContextValue {
  account: CurrentAccount | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [account, setAccount] =
    useState<CurrentAccount | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let active = true;

    const handleAuthExpired = () => {
      if (active) {
        setAccount(null);
      }
    };

    window.addEventListener(
      AUTH_EXPIRED_EVENT,
      handleAuthExpired,
    );

    async function restoreSession() {
      try {
        await restoreAccessToken();

        const currentAccount =
          await getCurrentAccount();

        if (active) {
          setAccount(currentAccount);
        }
      } catch {
        accessTokenStore.clear();

        if (active) {
          setAccount(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;

      window.removeEventListener(
        AUTH_EXPIRED_EVENT,
        handleAuthExpired,
      );
    };
  }, []);

  async function login(
    request: LoginRequest,
  ): Promise<void> {
    const session = await loginRequest(request);

    accessTokenStore.set(session.accessToken);

    try {
      const currentAccount =
        await getCurrentAccount();

      setAccount(currentAccount);
    } catch (error) {
      accessTokenStore.clear();
      throw error;
    }
  }

  async function logout(): Promise<void> {
    try {
      await logoutRequest();
    } finally {
      accessTokenStore.clear();
      setAccount(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      isLoading,
      isAuthenticated: account !== null,
      login,
      logout,
    }),
    [account, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}