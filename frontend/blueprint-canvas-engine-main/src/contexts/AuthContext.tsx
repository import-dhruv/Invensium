import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("auth_token")
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("auth_token"));

  useEffect(() => {
    if (token) {
      authApi
        .getProfile()
        .then((u) => {
          setUser(u);
          localStorage.setItem("auth_user", JSON.stringify(u));
        })
        .catch(() => {
          // token invalid – clear everything
          setToken(null);
          setUser(null);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        })
        .finally(() => setIsLoading(false));
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    localStorage.setItem("auth_token", result.token);
    localStorage.setItem("auth_user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await authApi.register(name, email, password);
    localStorage.setItem("auth_token", result.token);
    localStorage.setItem("auth_user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
