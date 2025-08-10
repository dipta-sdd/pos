You are absolutely right to demand a single, definitive document. This is the **NexusPOS - Definitive & Complete Frontend Plan**.

This master plan synthesizes every architectural decision, library choice, state management strategy, routing convention, and page component into one comprehensive blueprint. It is designed to be the single source of truth for your Next.js development team.

---

### **NexusPOS - Definitive & Complete Frontend Plan**

### **Part 1: Foundational Architecture & Core Concepts**

This section defines *how* we build the application.

#### **A. Technology Stack & Core Libraries**
*   **Framework:** **Next.js 14+** using the **App Router**.
*   **Language:** **TypeScript** for end-to-end type safety.
*   **Styling:** **Tailwind CSS** for a utility-first, highly customizable design system.
*   **UI Components:** **Shadcn/UI**, which provides accessible, unstyled component primitives (built with Radix UI) that are fully styled and owned by our project using Tailwind CSS.
*   **State Management:**
    *   **Global Session State:** **Zustand** will be used for a lightweight, fast, and simple store to manage the authenticated user's session data (user object, permissions, etc.).
    *   **UI/Local State:** Standard React hooks (`useState`, `useReducer`) for component-level state (e.g., managing form inputs, modal visibility).
*   **Data Fetching & Server Cache:** **TanStack Query (React Query)** is the designated library for all API communication. It will handle data fetching, caching, mutations, optimistic updates, and automatic revalidation, providing a seamless and responsive user experience.
*   **Forms:** **React Hook Form** for performance and power, coupled with **Zod** for schema-based validation, ensuring data integrity from the client to the server.
*   **Charts & Data Visualization:** A library like **Recharts** or **Chart.js** for rendering dashboard analytics.
*   **PWA (Progressive Web App):** The application will be configured as a PWA to enable offline functionality, primarily for the Point of Sale interface.

#### **B. Routing Strategy & Context Persistence**
*   **Primary URL Structure:** The authenticated application will live under a vendor-specific path: `/v/[vendorId]/...`. This provides clear namespacing and is managed by Next.js's dynamic routing.
*   **Branch Context Persistence:** A URL query parameter, `?branch=...`, will be used to maintain the user's branch selection across navigation.
    *   **Example:** `/v/123/dashboard?branch=45` means the user is viewing the dashboard for Vendor 123, filtered for Branch 45.
    *   An absent `?branch` query parameter (or `?branch=all`) signifies the "All Branches" context.
*   **Global Context Hooks (`/hooks/useAppContext.ts`):** A custom hook will centralize the logic for reading `vendorId` and `branch` from the URL parameters, making this context easily accessible to any component.

#### **C. State Management & Data Flow**
*   **Zustand Store (`/stores/sessionStore.ts`):** The single source of truth for the user's session. It holds the `user` object, active `vendor`, `permissions` array, and the list of `assignedBranches`. This store is populated once after login from the `/api/user` endpoint.
*   **React Query Data Flow:**
    *   **Query Keys:** All queries will use structured keys that include the context, e.g., `['dashboardData', { vendorId, branchContext }]`.
    *   **Automatic Re-fetching:** When the `branch` query parameter changes, the `branchContext` value updates. React Query detects this change in the query key and automatically refetches the data for the new context, creating a seamless filtering experience for the user.
    *   **Mutations:** `useMutation` hooks will be used for all `POST`, `PUT`, `DELETE` operations. Upon success, they will be configured to invalidate the relevant query keys, ensuring the UI always shows the latest data.

#### **D. Application Layout, Security & Fallbacks**
*   **Main Layout (`/v/[vendorId]/layout.tsx`):** The primary shell for the logged-in experience, rendering the `<Sidebar />` and `<Navbar />`.
*   **Permission Guarding (`/components/auth/PermissionGuard.tsx`):** A critical component that wraps UI elements (buttons, links, form fields). It reads permissions from the Zustand store and only renders its children if the user is authorized.
*   **Error Handling & Fallback UIs:** The application will fully utilize the Next.js App Router's file conventions:
    *   **Global Fallbacks (`/app`):** A root `loading.tsx`, `error.tsx`, and `not-found.tsx` for handling initial loads and top-level errors.
    *   **App-Specific Fallbacks (`/app/v/[vendorId]`):** A nested set of `loading.tsx`, `error.tsx`, and `not-found.tsx` files that render *within* the main app layout (Sidebar/Navbar intact), providing a much better user experience for in-app errors or loading states.

---

### **Part 2: Exhaustive List of All Application Pages & Files**

This list details *what* we build, organized by the final file structure.

#### **A. Auth, Public & Onboarding Pages (`/app/(public)/...` route group)**
*   `/login/page.tsx`
*   `/register/page.tsx`
*   `/forgot-password/page.tsx`
*   `/onboarding/page.tsx`: A mandatory, multi-step wizard for new vendors.
*   `/vendor-select/page.tsx`: A selection screen for users belonging to multiple vendors.

#### **B. Main Application Pages (`/app/v/[vendorId]/...`)**

*   **Layout Files:** `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`

**1. Dashboard**
*   `/dashboard/page.tsx`

**2. Point of Sale (POS)**
*   `/pos/page.tsx`: Full-screen interface with offline support.

**3. Sales**
*   `/sales/page.tsx` (Sales History)
*   `/sales/[saleId]/page.tsx` (Sale Detail)
*   `/returns/page.tsx` (Returns History)
*   `/returns/[returnId]/page.tsx` (Return Detail)
*   `/customers/page.tsx` (Customer List)
*   `/customers/[customerId]/page.tsx` (Customer Detail with History/Store Credit tabs)

**4. Catalog**
*   `/catalog/products/page.tsx` (Product List)
*   `/catalog/products/new/page.tsx` (Create Product Form)
*   `/catalog/products/[productId]/page.tsx` (Product Detail)
*   `/catalog/categories/page.tsx` (Category Management)

**5. Inventory**
*   `/inventory/stock-levels/page.tsx` (Inventory Overview)
*   `/inventory/adjustments/page.tsx` (New Adjustment Form)
*   `/inventory/adjustments/history/page.tsx` (Adjustment Log)
*   `/inventory/transfers/page.tsx` (Transfer List)
*   `/inventory/transfers/new/page.tsx` (New Transfer Form)
*   `/inventory/transfers/[transferId]/page.tsx` (Transfer Detail)
*   `/inventory/purchase-orders/page.tsx` (PO List)
*   `/inventory/purchase-orders/new/page.tsx` (New PO Form)
*   `/inventory/purchase-orders/[poId]/page.tsx` (PO Detail with "Receive Stock" workflow)
*   `/inventory/suppliers/page.tsx` (Supplier List)
*   `/inventory/suppliers/new/page.tsx` (New Supplier Form)
*   `/inventory/suppliers/[supplierId]/page.tsx` (Supplier Detail)

**6. Operations**
*   `/operations/cash-management/page.tsx` (Cash Session History)
*   `/operations/cash-management/[sessionId]/page.tsx` (Session Detail)
*   `/operations/expenses/page.tsx` (Expense List)
*   `/operations/expenses/new/page.tsx` (New Expense Form)

**7. Reports**
*   `/reports/page.tsx` (Main reports dashboard)
*   Each specific report (Sales, Profit, etc.) will be a component on this page.

**8. Settings**
*   `/settings/layout.tsx` (Nested layout for the settings section)
*   `/settings/profile/page.tsx`
*   `/settings/branches/page.tsx`
*   `/settings/staff/page.tsx`
*   `/settings/roles/page.tsx`
*   `/settings/roles/[roleId]/page.tsx`
*   `/settings/payment-methods/page.tsx`
*   `/settings/taxes/page.tsx`
*   `/settings/units-of-measure/page.tsx`
*   `/settings/receipts/page.tsx`
*   `/settings/promotions/page.tsx`
*   `/settings/promotions/new/page.tsx`
*   `/settings/promotions/[promoId]/page.tsx`
*   `/settings/billing/page.tsx`

#### **C. User Profile Page (`/app/profile/...`)**
*   `/profile/layout.tsx`
*   `/profile/details/page.tsx`
*   `/profile/security/page.tsx`

#### **D. Super Admin Pages (`/app/admin/...`)**
*   A completely separate route group with its own layout and pages (`/admin/dashboard`, `/admin/vendors`, etc.) for platform management.

This complete plan provides a clear, structured, and robust roadmap for building the NexusPOS frontend. It establishes a powerful and modern architecture that will result in a performant, maintainable, and highly professional application.