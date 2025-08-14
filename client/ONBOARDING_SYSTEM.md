# Onboarding System Documentation

This document explains the comprehensive onboarding system that guides users through setting up their vendor and branch before accessing the POS system.

## Overview

The onboarding system ensures that users complete the necessary business setup before accessing the POS functionality. It consists of two main steps:

1. **Vendor Setup** - Create the main business entity
2. **Branch Setup** - Create the first business location

## System Flow

```
User Registration/Login → Check Onboarding Status → Redirect Accordingly
                                                    ↓
                                    ┌─────────────────────────────────┐
                                    │                                 │
                                    ▼                                 ▼
                            No Vendor?                        Has Vendor?
                                    │                                 │
                                    ▼                                 ▼
                            Vendor Setup                    No Branch?
                                    │                                 │
                                    ▼                                 ▼
                            Branch Setup                    Branch Setup
                                    │                                 │
                                    ▼                                 ▼
                            POS Access                      POS Access
```

## Route Protection

### 1. **Root Route (`/`)**
- **Purpose**: Entry point that determines user's current status
- **Behavior**: 
  - Unauthenticated users → `/login`
  - Authenticated users without vendor → `/onboarding/vendor`
  - Authenticated users with vendor but no branch → `/onboarding/branch`
  - Authenticated users with both → `/pos`

### 2. **Onboarding Routes (`/onboarding/*`)**
- **Requirement**: Authentication required
- **Protection**: `AuthGuard` + `OnboardingGuard`
- **Purpose**: Guide users through business setup

### 3. **POS Routes (`/pos/*`)**
- **Requirement**: Authentication + Vendor + Branch
- **Protection**: `AuthGuard` + `POSGuard`
- **Purpose**: Main POS functionality

## Components

### 1. **OnboardingGuard**
- **Location**: `client/components/onboarding-guard.tsx`
- **Purpose**: Prevents access to POS if onboarding is incomplete
- **Behavior**: Redirects users to appropriate onboarding step

### 2. **POSGuard**
- **Location**: `client/components/pos-guard.tsx`
- **Purpose**: Ensures users have vendor and branch before accessing POS
- **Behavior**: Redirects to onboarding if setup is incomplete

### 3. **AuthGuard**
- **Location**: `client/components/auth-guard.tsx`
- **Purpose**: Basic authentication protection
- **Behavior**: Redirects unauthenticated users to login

## Pages

### 1. **Vendor Setup (`/onboarding/vendor`)**
- **Purpose**: First step - create business entity
- **Fields**:
  - Business Name (required)
  - Business Address (required)
  - Business Phone (required)
  - Business Email (required)
  - Website (optional)
  - Description (optional)
- **Success**: Redirects to `/onboarding/branch`

### 2. **Branch Setup (`/onboarding/branch`)**
- **Purpose**: Second step - create business location
- **Fields**:
  - Branch Name (required)
  - Branch Address (required)
  - Branch Phone (required)
  - Branch Email (required)
  - Manager Name (required)
  - Description (optional)
- **Success**: Redirects to `/pos`

### 3. **Onboarding Index (`/onboarding`)**
- **Purpose**: Smart redirect based on current status
- **Behavior**: Automatically determines next step

## API Endpoints Required

### 1. **Vendor Check**
```
GET /api/vendors/check
Response: { hasVendor: boolean }
```

### 2. **Branch Check**
```
GET /api/branches/check
Response: { hasBranch: boolean }
```

### 3. **Create Vendor**
```
POST /api/vendors
Body: {
  name: string,
  address: string,
  phone: string,
  email: string,
  website?: string,
  description?: string,
  owner_id: number
}
```

### 4. **Create Branch**
```
POST /api/branches
Body: {
  name: string,
  address: string,
  phone: string,
  email: string,
  manager_name: string,
  description?: string,
  created_by: number,
  updated_by: number
}
```

## File Structure

```
client/
├── app/
│   ├── (onboarding)/
│   │   ├── layout.tsx          # Onboarding layout with auth protection
│   │   ├── page.tsx            # Smart redirect based on status
│   │   ├── vendor/
│   │   │   └── page.tsx        # Vendor setup form
│   │   └── branch/
│   │       └── page.tsx        # Branch setup form
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout (login/signup)
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── signup/
│   │       └── page.tsx        # Signup page
│   ├── pos/
│   │   ├── layout.tsx          # POS layout with full protection
│   │   └── page.tsx            # POS dashboard
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Smart redirect entry point
│   └── providers.tsx            # Auth provider setup
├── components/
│   ├── auth-guard.tsx          # Basic authentication protection
│   ├── onboarding-guard.tsx    # Onboarding completion check
│   ├── pos-guard.tsx           # POS access requirements
│   ├── navbar.tsx              # Dynamic navigation
│   └── user-info.tsx           # User profile component
└── lib/
    └── hooks/
        └── useAuth.tsx         # Authentication context and hook
```

## User Experience Flow

### 1. **New User Journey**
```
Sign Up → Login → Vendor Setup → Branch Setup → POS Access
```

### 2. **Returning User Journey**
```
Login → Check Status → POS Access (if complete) or Continue Onboarding
```

### 3. **Incomplete Setup Journey**
```
Login → Redirect to Current Step → Complete Setup → Continue to Next Step
```

## Security Features

- **Authentication Required**: All onboarding routes require login
- **Route Protection**: Guards prevent unauthorized access
- **Automatic Redirects**: Users are always directed to the correct step
- **Status Validation**: Server-side checks ensure data integrity

## Error Handling

- **API Failures**: Graceful fallback with user-friendly error messages
- **Network Issues**: Retry mechanisms and offline handling
- **Validation Errors**: Form validation with clear error messages
- **Redirect Failures**: Fallback to appropriate onboarding step

## Customization Options

### 1. **Additional Onboarding Steps**
- Add new steps by extending the guard components
- Update the progress indicators
- Modify the redirect logic

### 2. **Field Customization**
- Modify form fields in vendor/branch setup pages
- Add validation rules
- Customize success/error messages

### 3. **Styling and Branding**
- Update colors, fonts, and layout
- Add company logo and branding
- Customize progress indicators

## Testing Scenarios

### 1. **New User Flow**
- Test complete onboarding journey
- Verify all redirects work correctly
- Ensure data persistence

### 2. **Returning User Flow**
- Test login with incomplete setup
- Verify correct step redirection
- Test completion of remaining steps

### 3. **Edge Cases**
- Test with network failures
- Verify error handling
- Test validation scenarios

## Future Enhancements

### 1. **Multi-Step Forms**
- Add progress bars
- Save partial progress
- Allow step navigation

### 2. **Additional Business Setup**
- Tax configuration
- Payment method setup
- Inventory categories
- User roles and permissions

### 3. **Onboarding Analytics**
- Track completion rates
- Identify drop-off points
- A/B test different flows

This onboarding system provides a robust, user-friendly way to ensure all users complete the necessary business setup before accessing the POS functionality. 