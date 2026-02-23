import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar_url?: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

// ─── Secure Store Keys ────────────────────────────────────────────────────────

export const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // ── Auto-login on mount ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (token && userJson) {
          setState({ user: JSON.parse(userJson), token, isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  // ── Persist helpers ───────────────────────────────────────────────────────
  const persistSession = async (token: string, user: User) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    setState({ user, token, isLoading: false });
  };

  const clearSession = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setState({ user: null, token: null, isLoading: false });
  };

  // ── Auth actions ──────────────────────────────────────────────────────────

  // freeapi login response (after envelope unwrap):
  // { user: {..., _id, username}, accessToken, refreshToken }
  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<{
      user: {
        _id: string;
        username: string;
        email: string;
        role: string;
        avatar: { url: string };
        isEmailVerified: boolean;
      };
      accessToken: string;
      refreshToken: string;
    }>("/users/login", { username, password });

    const user: User = {
      id: res.user._id,
      username: res.user.username,
      email: res.user.email,
      role: res.user.role,
      avatar_url: res.user.avatar?.url,
      isEmailVerified: res.user.isEmailVerified,
    };
    await persistSession(res.accessToken, user);
  }, []);

  // freeapi register response (after envelope unwrap):
  // { user: {...} }  — no token; must verify email before logging in
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await api.post<{ user: unknown }>("/users/register", {
        username,
        email,
        password,
      });
      // No session persisted — user must log in after email verification.
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch {
      // best-effort; clear locally regardless
    } finally {
      await clearSession();
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await api.post<{ token: string }>("/users/refresh-token");
      await SecureStore.setItemAsync(TOKEN_KEY, res.token);
      setState((s) => ({ ...s, token: res.token }));
      return res.token;
    } catch {
      await clearSession();
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
