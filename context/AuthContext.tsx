import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { api, REFRESH_TOKEN_KEY } from "../services/api";

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
  updateAvatar: (formData: FormData) => Promise<void>;
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => Promise<void>;
}

export const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

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

  const persistSession = async (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    setState({ user, token: accessToken, isLoading: false });
  };

  const clearSession = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setState({ user: null, token: null, isLoading: false });
  };

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
    await persistSession(res.accessToken, res.refreshToken, user);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await api.post<{ user: unknown }>("/users/register", {
        username,
        email,
        password,
        role: "USER",
      });
    },
    [],
  );

  const updateAvatar = useCallback(async (formData: FormData) => {
    const res = await api.patch<{
      avatar: { url: string };
    }>("/users/avatar", formData);

    setState((s) => {
      if (!s.user) return s;
      const newUser = { ...s.user, avatar_url: res.avatar.url };
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
      return { ...s, user: newUser };
    });
  }, []);

  const updateProfile = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }) => {
      const res = await api.patch<{
        _id: string;
        username: string;
        email: string;
        role: string;
        avatar: { url: string };
        isEmailVerified: boolean;
      }>("/users/account", data);

      setState((s) => {
        if (!s.user) return s;
        const newUser: User = {
          id: res._id,
          username: res.username,
          email: res.email,
          role: res.role,
          avatar_url: res.avatar?.url,
          isEmailVerified: res.isEmailVerified,
        };
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
        return { ...s, user: newUser };
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch (err) {
    } finally {
      await clearSession();
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedRefreshToken =
        await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const res = await api.post<{
        accessToken: string;
        refreshToken?: string;
      }>(
        "/users/refresh-token",
        storedRefreshToken ? { refreshToken: storedRefreshToken } : undefined,
      );
      await SecureStore.setItemAsync(TOKEN_KEY, res.accessToken);
      if (res.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, res.refreshToken);
      }
      setState((s) => ({ ...s, token: res.accessToken }));
      return res.accessToken;
    } catch {
      await clearSession();
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshToken,
        updateAvatar,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
