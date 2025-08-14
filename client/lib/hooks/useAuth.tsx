import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getUser, isAuthenticated, logout, getToken } from '../auth';
import type { User } from '../auth';
import api from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
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
    // Check authentication status on mount
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const currentUser = getUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token exists but no user data, try to fetch user profile
          await refreshUser();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get('/auth/user-profile');

      if (response.status === 200) {
        const userData = response.data as any;
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Token might be invalid, clear auth
        handleLogout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      handleLogout();
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
    setUser,
    logout: handleLogout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
