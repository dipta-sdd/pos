import type { AuthResponse, User } from "../types/auth";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, mobile?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  password: string;
  password_confirmation: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (getToken()) {
          await refreshUser();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error checking auth:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    mobile?: string,
  ): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        mobile,
      });

      if (response.status === 200) {
        const data = response.data as any;

        setToken(data);
        setUser(data.user);
        setIsLoading(false);

        return true;
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Login error:", error);
      setIsLoading(false);

      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.status === 200 || response.status === 201) {
        return true;
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Registration error:", error);

      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const token = getToken();

      if (!token) {
        setIsLoading(false);

        return;
      }

      const response = await api.get("/auth/me");

      if (response.status === 200) {
        const userData = response.data as any;

        setUser(userData);
        setIsLoading(false);
      } else {
        handleLogout();
        setIsLoading(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error refreshing user:", error);
      handleLogout();
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout: handleLogout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === "undefined") return;

  const expires = new Date();

  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];

    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

const deleteCookie = (name: string): void => {
  if (typeof window === "undefined") return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Get stored token
export const getToken = (): string | null => {
  return getCookie("token");
};

// Store authentication data
export const setToken = (auth: AuthResponse): void => {
  setCookie("token", auth.access_token, 7); // 7 days
};

// Logout function
export const logout = (): void => {
  deleteCookie("token");
  // Note: Navigation should be handled by React Router, not window.location
};
