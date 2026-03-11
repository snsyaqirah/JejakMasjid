import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authApi, userFromMeta, clearTokens, getAccessToken } from "@/lib/api";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  /** Call after verifyOtp or login succeeds — stores user in state */
  authenticate: (raw: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
  }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((raw) => setUser(userFromMeta(raw)))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const authenticate = useCallback(
    (raw: { id: string; email: string; user_metadata: Record<string, unknown> }) => {
      setUser(userFromMeta(raw));
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
