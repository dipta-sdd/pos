// Auth utility functions for managing authentication state

export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role?: string;
  branch_id?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

const deleteCookie = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Get stored token
export const getToken = (): string | null => {
  return getCookie('auth_token');
};

// Get stored user
export const getUser = (): User | null => {
  const userStr = getCookie('auth_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Store authentication data
export const setAuth = (auth: AuthResponse): void => {
  setCookie('auth_token', auth.token, 7); // 7 days
  setCookie('auth_user', JSON.stringify(auth.user), 7);
};

// Clear authentication data
export const clearAuth = (): void => {
  deleteCookie('auth_token');
  deleteCookie('auth_user');
};

// Logout function
export const logout = (): void => {
  clearAuth();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}; 