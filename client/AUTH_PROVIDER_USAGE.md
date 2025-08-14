# Auth Provider Usage Guide

This document explains how to use the comprehensive authentication system that provides auth data to all pages and components.

## Overview

The auth system consists of:
- **AuthProvider**: Context provider that wraps the entire app
- **useAuth Hook**: Hook to access authentication state and functions
- **AuthGuard**: Component to protect routes based on authentication status
- **Updated Components**: Login, signup, navbar, and other components using the auth context

## Setup

### 1. AuthProvider in providers.tsx

The `AuthProvider` is already set up in `app/providers.tsx` and wraps all components:

```tsx
export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </AuthProvider>
  );
}
```

### 2. Using the useAuth Hook

In any component, you can access authentication data using the `useAuth` hook:

```tsx
import { useAuth } from "@/lib/hooks/useAuth";

export function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Available Auth Data

The `useAuth` hook provides:

- **`user`**: User object with firstName, lastName, email, mobile, etc.
- **`isAuthenticated`**: Boolean indicating if user is logged in
- **`isLoading`**: Boolean indicating if auth state is being checked
- **`login(email, password)`**: Function to log in a user
- **`register(userData)`**: Function to register a new user
- **`logout()`**: Function to log out the current user
- **`refreshUser()`**: Function to refresh user data from server

## Route Protection

### Protected Routes (require authentication)

Use `AuthGuard` with `requireAuth={true}`:

```tsx
import { AuthGuard } from "@/components/auth-guard";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      {children}
    </AuthGuard>
  );
}
```

### Public Routes (prevent authenticated users)

Use `AuthGuard` with `requireAuth={false}`:

```tsx
import { AuthGuard } from "@/components/auth-guard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false} redirectTo="/pos">
      {children}
    </AuthGuard>
  );
}
```

## Examples

### 1. User Profile Component

```tsx
import { useAuth } from "@/lib/hooks/useAuth";
import { User, Mail, Phone } from "lucide-react";

export function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      
      {user.mobile && (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>{user.mobile}</span>
        </div>
      )}
    </div>
  );
}
```

### 2. Conditional Navigation

```tsx
import { useAuth } from "@/lib/hooks/useAuth";

export function Navigation() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <div>
          <span>Welcome, {user?.firstName}!</span>
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Profile</a>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <a href="/login">Login</a>
          <a href="/signup">Sign Up</a>
        </div>
      )}
    </nav>
  );
}
```

### 3. Loading States

```tsx
import { useAuth } from "@/lib/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {isAuthenticated ? <AuthenticatedApp /> : <PublicApp />}
    </div>
  );
}
```

## API Integration

The auth system automatically handles:

- **JWT Tokens**: Stored as HttpOnly cookies for security
- **User Data**: Stored in localStorage for easy access
- **Automatic Refresh**: User data is refreshed when needed
- **Error Handling**: Automatic logout on authentication errors

## Security Features

- **HttpOnly Cookies**: JWT tokens are stored securely
- **Automatic Cleanup**: Auth data is cleared on logout
- **Route Protection**: Unauthorized access is prevented
- **Token Validation**: Automatic token validation and refresh

## File Structure

```
client/
├── lib/
│   ├── auth.ts                 # Auth utility functions
│   └── hooks/
│       └── useAuth.ts          # Auth context and hook
├── components/
│   ├── auth-guard.tsx          # Route protection component
│   ├── navbar.tsx              # Updated navbar with auth
│   └── user-info.tsx           # Example user info component
├── app/
│   ├── providers.tsx           # Auth provider setup
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout with protection
│   │   ├── login/page.tsx      # Login using auth context
│   │   └── signup/page.tsx     # Signup using auth context
│   └── pos/
│       ├── layout.tsx          # POS layout with protection
│       └── page.tsx            # Dashboard using auth context
```

## Best Practices

1. **Always check loading state** before rendering auth-dependent content
2. **Use AuthGuard** for route protection instead of manual checks
3. **Handle errors gracefully** in login/register functions
4. **Use the user object** from useAuth instead of local state
5. **Implement proper loading states** for better UX

## Troubleshooting

### Common Issues

1. **"useAuth must be used within an AuthProvider"**
   - Ensure your component is wrapped by the AuthProvider in providers.tsx

2. **Authentication not persisting**
   - Check that cookies are enabled
   - Verify the server is setting HttpOnly cookies correctly

3. **Route protection not working**
   - Ensure AuthGuard is properly configured
   - Check that requireAuth prop is set correctly

4. **User data not updating**
   - Use the refreshUser function when needed
   - Check that the server API endpoints are working

This auth system provides a robust, secure, and easy-to-use authentication solution for your POS application. 