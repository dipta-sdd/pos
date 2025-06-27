Of course. This is the master document, consolidating all project details, the final database schema, a complete list of pages, and a comprehensive mapping of the RESTful API endpoints required to power the application.

---

### **NexusPOS - Master Project Plan**

### 1. Project Overview

*   **Project Title:** NexusPOS
*   **Elevator Pitch:** A cloud-native, multi-vendor Point of Sale (POS) platform built for modern retail. NexusPOS empowers any business owner to instantly set up their digital shop, manage multiple physical branches with branch-specific settings, build a custom team with granular role-based permissions, and handle complex sales with product variants, returns, and multi-payment options.
*   **Core Features:**
    *   **Financial Management:** Cash flow tracking, supplier and procurement management through Purchase Orders.
    *   **Sales & Promotions:** Flexible discounts at both the product and sale level.
    *   **Multi-Vendor & Multi-Branch Architecture:** Sandboxed vendor environments, each with multiple physical locations.
    *   **Advanced Role-Based Access Control (RBAC):** Vendor-defined roles with granular, assignable permissions.
    *   **Comprehensive Product Catalog:** Categories, subcategories, and product variants (with unique price/SKU/barcode).
    *   **Per-Branch Inventory Management:** Stock tracking for each variant at each location.
    *   **Modern POS Interface:** Multi-payment sales, returns processing, and cash register management.
    *   **Full Audit Trail:** All critical data is timestamped and user-stamped.

---

### 2. Database Schema (with Audit Fields)

I will add a standard "audit mixin" to each model. In Django, this is often done with an abstract base class. For clarity, I'll list the fields explicitly on each table.

**Audit Fields:**
*   `created_at (DateTimeField, auto_now_add=True)`
*   `updated_at (DateTimeField, auto_now=True)`
*   `created_by (FK to User, nullable=True)`
*   `updated_by (FK to User, nullable=True)`

*(Note: `created_by`/`updated_by` are nullable because some actions, like initial system setup, might not have a user context.)*

---

#### Core & Access Control
*   **`Vendor`**: `id, name, owner (FK), subscription_tier, created_at, updated_at`
*   **`Membership`**: `id, user (FK), vendor (FK), role (FK), created_at, updated_at, created_by, updated_by`
*   **`Role`**: `id, name, vendor (FK), permissions (M2M), created_at, updated_at, created_by, updated_by`

#### Location & Staffing
*   **`Branch`**: `id, name, address, vendor (FK), created_at, updated_at, created_by, updated_by`
*   **`BillingCounter`**: `id, name, branch (FK), created_at, updated_at, created_by, updated_by`
*   **`UserBranchAssignment`**: `id, membership (FK), branch (FK), created_at, updated_at, created_by, updated_by`

#### Cash Management
*   **`CashRegisterSession`**: `id, billing_counter (FK), user (FK), opening_balance, closing_balance, started_at, ended_at, status`
    *   *(This table uses `started_at`/`ended_at` instead of the standard audit fields, as they are more contextually relevant.)*
*   **`CashTransaction`**: `id, session (FK), amount, type, notes, created_at, created_by (user who performed the transaction)`
    *   *(`updated_at`/`updated_by` are less relevant here as these transactions should be immutable.)*

#### Procurement & Suppliers
*   **`Supplier`**: `id, name, contact_person, email, phone, address, vendor (FK), created_at, updated_at, created_by, updated_by`
*   **`PurchaseOrder`**: `id, supplier (FK), branch (FK), status, total_amount, order_date, expected_delivery_date, vendor (FK), created_at, updated_at, created_by, updated_by`
*   **`PurchaseOrderItem`**: `id, purchase_order (FK), product_variant (FK), quantity_ordered, quantity_received, unit_cost, created_at, updated_at, created_by, updated_by`

#### Product Catalog
*   **`Category`**: `id, name, vendor (FK), created_at, updated_at, created_by, updated_by`
*   **`SubCategory`**: `id, name, category (FK), vendor (FK), created_at, updated_at, created_by, updated_by`
*   **`Product`**: `id, name, description, subcategory (FK), vendor (FK), created_at, updated_at, created_by, updated_by`
*   **`ProductVariant`**: `id, product (FK), name, price, sku, barcode, discount_percentage, created_at, updated_at, created_by, updated_by`
*   **`InventoryItem`**: `id, product_variant (FK), branch (FK), quantity, updated_at, updated_by`
    *   *(Only tracking updates is most relevant here, as it changes frequently.)*

#### Sales, Payments & Returns
*   **`Customer`**: `id, name, email, vendor (FK), created_at, updated_at, created_by, updated_by`
*   **`PaymentMethod`**: `id, name, vendor (FK), branch (FK), is_active, created_at, updated_at, created_by, updated_by`
*   **`Sale`**: `id, final_amount, status, vendor (FK), branch (FK), user (FK), billing_counter (FK), created_at`
    *   *(Sales are generally immutable, so `created_at` and `user` (as `created_by`) are sufficient.)*
*   **`SaleItem`**: `id, sale (FK), product_variant (FK), quantity, price_at_sale, discount_percentage`
    *   *(Immutable line items of a sale.)*
*   **`SalePayment`**: `id, sale (FK), payment_method (FK), amount`
    *   *(Immutable records of payment.)*
*   **`Return`**: `id, original_sale (FK), reason, refund_amount, user (FK), branch (FK), created_at`
    *   *(Returns are also immutable events.)*
*   **`ReturnItem`**: `id, return_instance (FK), sale_item (FK), quantity`
    *   *(Immutable line items of a return.)*

#### Unified Financial Log
*   **`Bill` (or `FinancialLedger`)**: `id, vendor (FK), transaction_type, reference_id, amount, description, created_at`
    *   *(This is an immutable log, so only `created_at` is needed.)*


---

### 3. Frontend Pages & Required REST APIs

This section maps each frontend page to the specific API endpoints it will consume. All endpoints are prefixed with `/api/v1/`.

#### **Public Site**
*   **Page:** `/register`
    *   **Purpose:** New user and vendor signup.
    *   **API:** `POST /auth/register/` (sends user and vendor name).

---
#### **Main Application (`/app`)**

*   **Page:** `/app/dashboard`
    *   **Purpose:** High-level overview of the business.
    *   **API:** `GET /dashboard/summary/` (A dedicated endpoint that returns aggregated data like total sales today, low-stock items, recent activity, scoped by user permissions).

*   **Page:** `/app/pos`
    *   **Purpose:** The main Point of Sale interface.
    *   **APIs:**
        *   `POST /cash-sessions/open/` (To start a shift, sends `opening_balance`).
        *   `GET /branches/{branch_id}/pos-data/` (A "workhorse" endpoint to get all data needed for the POS: product variants, categories, enabled payment methods, billing counters for the branch).
        *   `POST /sales/` (To submit a completed sale with all its items and payments).
        *   `POST /cash-sessions/{id}/close/` (To end a shift, sends `closing_balance`).
        *   `POST /cash-transactions/` (To record cash movements, like a transfer to a safe).

*   **Pages:** `/app/sales` and `/app/sales/{saleId}`
    *   **Purpose:** View sales history and details of a single sale.
    *   **APIs:**
        *   `GET /sales/` (Returns a paginated list of sales. Supports filtering via query params: `?branch_id=X&user_id=Y&date_range=...`).
        *   `GET /sales/{id}/` (Returns the full details of one sale, including its `SaleItem`s and `SalePayment`s).
        *   `POST /returns/` (Initiates a return against a specific sale).

*   **Pages:** `/app/returns` and `/app/returns/{returnId}`
    *   **Purpose:** View return history and details.
    *   **APIs:**
        *   `GET /returns/` (A paginated list of all return transactions).
        *   `GET /returns/{id}/` (Details of a single return and its items).

*   **Pages:** `/app/products` and `/app/products/{productId}`
    *   **Purpose:** Manage the product catalog and its variants.
    *   **APIs:**
        *   `GET /products/` (List all parent products).
        *   `POST /products/` (Create a new parent product).
        *   `GET /products/{id}/` (Get details of one parent product).
        *   `PUT /products/{id}/` (Update a parent product).
        *   `GET /products/{id}/variants/` (List all variants for a specific product).
        *   `POST /products/{id}/variants/` (Create a new variant for a product).
        *   `PUT /variants/{variant_id}/` (Update a specific product variant's details like price, SKU, etc.).
        *   `DELETE /variants/{variant_id}/`

*   **Page:** `/app/inventory`
    *   **Purpose:** View and manage stock levels.
    *   **APIs:**
        *   `GET /inventory/` (Returns a comprehensive list of stock levels, filterable by branch: `?branch_id=X`).
        *   `POST /inventory/adjust/` (To manually adjust the stock count of an `InventoryItem`).

*   **Page:** `/app/procurement/suppliers` and `/app/procurement/orders`
    *   **Purpose:** Manage suppliers and purchase orders.
    *   **APIs:**
        *   `GET /suppliers/`, `POST /suppliers/`, `GET /suppliers/{id}/`, `PUT /suppliers/{id}/` (Standard CRUD for suppliers).
        *   `GET /purchase-orders/`, `POST /purchase-orders/` (CRUD for purchase orders).
        *   `GET /purchase-orders/{id}/` (Details of a PO, including its line items).
        *   `POST /purchase-orders/{id}/receive-stock/` (A special action to receive inventory, which updates `PurchaseOrderItem` and `InventoryItem` tables).

*   **Page:** `/app/cash-management`
    *   **Purpose:** View cash register sessions and transactions.
    *   **APIs:**
        *   `GET /cash-sessions/` (List of all sessions).
        *   `GET /cash-transactions/` (List of all cash movements).

*   **Page:** `/app/reports/bills`
    *   **Purpose:** A unified financial ledger.
    *   **API:** `GET /bills/` (Returns a filterable list of all records from the `Bill` table).

---
#### **Settings Pages (`/app/settings`)**

*   **Page:** `/app/settings/branches`
    *   **API:** `GET /branches/`, `POST /branches/`, `PUT /branches/{id}/`.
    *   **API:** `GET /branches/{id}/billing-counters/`, `POST /branches/{id}/billing-counters/` (To manage counters for a specific branch).

*   **Page:** `/app/settings/payment-methods`
    *   **API:** `GET /payment-methods/`, `POST /payment-methods/`, `PUT /payment-methods/{id}/`.

*   **Page:** `/app/settings/staff`
    *   **API:** `GET /memberships/` (List all staff in the vendor's account).
    *   `POST /memberships/invite/` (Sends an email invitation to a new staff member).
    *   `PUT /memberships/{id}/` (To change a user's role or branch assignments).

*   **Page:** `/app/settings/roles` and `/app/settings/roles/{roleId}`
    *   **API:** `GET /roles/`, `POST /roles/`, `GET /roles/{id}/`, `PUT /roles/{id}/` (CRUD for roles).
    *   **API:** `GET /permissions/` (To get the master list of all available permissions to display in the UI).

---

### 4. Additional & Utility REST APIs

These are essential endpoints that support the overall application functionality.

*   **Authentication:**
    *   `POST /auth/token/` (Login: exchange username/password for JWT access and refresh tokens).
    *   `POST /auth/token/refresh/` (Use a refresh token to get a new access token).

*   **Current User State:**
    *   `GET /users/me/`
        *   **Crucial Endpoint:** Returns all information about the currently logged-in user needed by the frontend to build its UI.
        *   **Payload:** Includes user details (name, email), vendor info, assigned role, and a flattened list of their permission codenames (e.g., `["product.create", "sale.create", "cash.manage_session"]`). The frontend uses this list to conditionally render buttons, links, and pages.

*   **Lookup Endpoints (for dropdowns):**
    *   `GET /lookups/categories/` (Returns a simple list of `{id, name}` for product category dropdowns).
    *   `GET /lookups/suppliers/` (List of `{id, name}` for supplier selection in purchase orders).
    *   `GET /lookups/roles/` (List of `{id, name}` for assigning roles to staff).
    *   `GET /lookups/branches/` (List of `{id, name}` for various branch selection forms).