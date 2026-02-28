import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "jejakmasjid_user";
const USERS_KEY = "jejakmasjid_users";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const getUsers = (): Record<string, { profile: UserProfile; password: string }> => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const entry = users[email.toLowerCase()];
    if (!entry || entry.password !== password) return false;
    setUser(entry.profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.profile));
    return true;
  };

  const signup = async (email: string, password: string, displayName: string): Promise<boolean> => {
    const users = getUsers();
    const key = email.toLowerCase();
    if (users[key]) return false; // already exists

    const profile: UserProfile = {
      id: crypto.randomUUID(),
      email: key,
      displayName,
      createdAt: new Date().toISOString(),
    };

    users[key] = { profile, password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
