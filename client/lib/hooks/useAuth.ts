import { useState, useEffect } from 'react';
import { getUser, isAuthenticated, logout } from '../auth';
import type { User } from '../auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser(getUser());
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    isLoading,
    logout: handleLogout,
  };
}; 