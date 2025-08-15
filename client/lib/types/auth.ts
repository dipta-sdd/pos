// Auth utility functions for managing authentication state

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  vendor: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
