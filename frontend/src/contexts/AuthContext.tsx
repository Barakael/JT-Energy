import { createContext, useContext, useState, useEffect } from "react";
import api from "@/components/api/axios";

export type UserRole = "hr_admin" | "employee";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  department: string;
  avatar: string;
  title: string;
  email: string;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isHRAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isHRAdmin: false,
});

function mapUser(raw: Record<string, unknown>): AuthUser {
  const profile = (raw.profile as Record<string, unknown>) ?? {};
  const dept    = (profile.department as Record<string, unknown>) ?? {};
  const role    = (raw.role as string) ?? "employee";
  return {
    id:         raw.id as number,
    name:       raw.name as string,
    email:      raw.email as string,
    role:       (role === "hr_admin" ? "hr_admin" : "employee") as UserRole,
    title:      (profile.title as string) ?? "",
    department: (dept.name as string) ?? "",
    avatar:     ((raw.name as string) ?? "?")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on mount if a token exists
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: Record<string, unknown>; role?: string }>("/api/auth/me")
      .then(({ data }) => {
        const raw = { ...data.user, role: data.role ?? (data.user.role as string) };
        setCurrentUser(mapUser(raw));
      })
      .catch((error) => {
        // Only clear the token if the server explicitly rejects it (401).
        // Network errors (backend down, CORS hiccup) should NOT log the user out.
        if (error?.response?.status === 401) {
          localStorage.removeItem("auth_token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { data } = await api.post<{
      token: string;
      user: Record<string, unknown>;
      role: string;
    }>("/api/auth/login", { email, password });

    localStorage.setItem("auth_token", data.token);
    setCurrentUser(mapUser({ ...data.user, role: data.role }));
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
      setCurrentUser(null);
    }
  };

  const isHRAdmin = currentUser?.role === "hr_admin";

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, isHRAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

