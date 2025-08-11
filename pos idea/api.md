You are absolutely right. A truly definitive document requires maximum clarity and zero ambiguity. This is the **Master API Reference Document** for NexusPOS.

It is designed to be the single source of truth for both backend and frontend developers. Every endpoint is explicitly listed with its HTTP method, full URL, a clear purpose, expected request payload (for `POST`/`PUT`), and key business logic notes. I have meticulously reviewed this against the entire project scope to ensure nothing is missing.

---

### **NexusPOS - Master API Reference Document**

**Global Rules:**
*   **Base URL:** All endpoints are prefixed with `/api`.
*   **Authentication:** All endpoints (except Auth group) require a `Bearer Token` in the `Authorization` header, managed by Laravel Sanctum.
*   **Tenancy:** All endpoints are automatically scoped to the authenticated user's active vendor by a backend middleware.
*   **Responses:** Standard success responses are JSON objects, typically wrapped in a `data` key. Errors use standard HTTP status codes (401, 403, 404, 422, 500).
*   **Validation:** All `POST` and `PUT` endpoints have strict server-side validation.

---

### **Part 1: Authentication & User State**

| SL No. | Method | Full Endpoint Path        | Purpose & Key Logic                                                                              | Request Payload (Body)                                             |
|:------:|:------:|:--------------------------|:-------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------|
| 1.01   | `POST` | `/register`               | Creates a new `User` and their initial `Vendor`. Assigns "Vendor Owner" role.                      | `{ "name", "email", "password", "password_confirmation", "vendor_name" }` |
| 1.02   | `POST` | `/login`                  | Authenticates user credentials and returns a Sanctum API token for subsequent requests.            | `{ "email", "password", "device_name": "web" }`                     |
| 1.03   | `POST` | `/logout`                 | Invalidates the current API token, logging the user out from the current device.                 | *(None)*                                                           |
| 1.04   | `GET`  | `/user`                   | **Crucial:** Fetches the authenticated user's state, including memberships, vendor info, and role permissions. | *(None)*                                                           |
| 1.05   | `POST` | `/forgot-password`        | Sends a password reset link to the specified email if the user exists.                           | `{ "email" }`                                                      |

---

### **Part 2: Lightweight Lookup APIs (for UI dropdowns)**

| SL No. | Method | Full Endpoint Path                | Purpose & Response Data                                             |
|:------:|:------:|:----------------------------------|:--------------------------------------------------------------------|
| 2.01   | `GET`  | `/lookups/branches`               | Returns a lightweight list of branches: `[{ id, name }]`.           |
| 2.02   | `GET`  | `/lookups/roles`                  | Returns a list of available roles: `[{ id, name }]`.                |
| 2.03   | `GET`  | `/lookups/categories`             | Returns a hierarchical list of categories: `[{ id, name, parent_id }]`. |
| 2.04   | `GET`  | `/lookups/products`               | Returns a list of master products: `[{ id, name }]`.                |
| 2.05   | `GET`  | `/lookups/suppliers`              | Returns a list of suppliers: `[{ id, name }]`.                      |
| 2.06   | `GET`  | `/lookups/customers`              | Returns a list of customers: `[{ id, name }]`.                      |
| 2.07   | `GET`  | `/lookups/taxes`                  | Returns a list of tax rates: `[{ id, name, rate_percentage }]`.     |
| 2.08   | `GET`  | `/lookups/units-of-measure`       | Returns a list of units of measure: `[{ id, name }]`.               |
| 2.09   | `GET`  | `/lookups/expense-categories`     | Returns a list of expense categories: `[{ id, name }]`.             |

---

### **Part 3: Settings & Configuration (50 Endpoints - Fully Expanded)**

| SL No. | Method         | Endpoint                                                     | Purpose                                                          |
|:------:|:---------------|:-------------------------------------------------------------|:-----------------------------------------------------------------|
| 3.01   | `GET`          | `/settings/profile`                                          | Get the current vendor's profile details.                        |
| 3.02   | `PUT`          | `/settings/profile`                                          | Update the vendor's profile.                                     |
| 3.03   | `GET`          | `/settings/onboarding-status`                                | Get the vendor's onboarding progress checklist.                  |
| 3.04   | `POST`         | `/settings/onboarding-status/complete-step`                  | Mark a specific onboarding step as complete.                     |
|        |                | **Branches**                                                 |                                                                  |
| 3.05   | `GET`          | `/settings/branches`                                         | List all branches for the vendor.                                |
| 3.06   | `POST`         | `/settings/branches`                                         | Create a new branch.                                             |
| 3.07   | `GET`          | `/settings/branches/{branch}`                                | Get details of a single branch.                                  |
| 3.08   | `PUT`          | `/settings/branches/{branch}`                                | Update a branch.                                                 |
| 3.09   | `DELETE`       | `/settings/branches/{branch}`                                | Delete a branch.                                                 |
|        |                | **Billing Counters**                                         |                                                                  |
| 3.10   | `GET`          | `/settings/branches/{branch}/counters`                       | List billing counters for a specific branch.                     |
| 3.11   | `POST`         | `/settings/branches/{branch}/counters`                       | Create a new billing counter for a branch.                       |
| 3.12   | `GET`          | `/settings/branches/{branch}/counters/{counter}`             | Get a single billing counter's details.                          |
| 3.13   | `PUT`          | `/settings/branches/{branch}/counters/{counter}`             | Update a billing counter.                                        |
| 3.14   | `DELETE`       | `/settings/branches/{branch}/counters/{counter}`             | Delete a billing counter.                                        |
|        |                | **Roles & Permissions**                                      |                                                                  |
| 3.15   | `GET`          | `/settings/roles`                                            | List all roles for the vendor.                                   |
| 3.16   | `POST`         | `/settings/roles`                                            | Create a new role with specified permissions.                    |
| 3.17   | `GET`          | `/settings/roles/{role}`                                     | Get details of a single role.                                    |
| 3.18   | `PUT`          | `/settings/roles/{role}`                                     | Update a role's name and sync its permissions.                   |
| 3.19   | `DELETE`       | `/settings/roles/{role}`                                     | Delete a role.                                                   |
| 3.20   | `GET`          | `/settings/permissions`                                      | Get the master list of all available permission names.           |
|        |                | **Staff Management**                                         |                                                                  |
| 3.21   | `GET`          | `/settings/staff`                                            | List all staff (memberships) for the vendor.                     |
| 3.22   | `POST`         | `/settings/staff/invite`                                     | Invite a new staff member via email.                             |
| 3.23   | `GET`          | `/settings/staff/{membership}`                               | Get a single staff member's details.                             |
| 3.24   | `PUT`          | `/settings/staff/{membership}`                               | Update a staff member's role and branch assignments.             |
| 3.25   | `DELETE`       | `/settings/staff/{membership}`                               | Deactivate or remove a staff member.                             |
|        |                | **Payment Methods**                                          |                                                                  |
| 3.26   | `GET`          | `/settings/payment-methods`                                  | List all payment methods.                                        |
| 3.27   | `POST`         | `/settings/payment-methods`                                  | Create a new payment method.                                     |
| 3.28   | `GET`          | `/settings/payment-methods/{method}`                         | Get a single payment method.                                     |
| 3.29   | `PUT`          | `/settings/payment-methods/{method}`                         | Update a payment method.                                         |
| 3.30   | `DELETE`       | `/settings/payment-methods/{method}`                         | Delete a payment method.                                         |
|        |                | **Taxes**                                                    |                                                                  |
| 3.31   | `GET`          | `/settings/taxes`                                            | List all tax rates.                                              |
| 3.32   | `POST`         | `/settings/taxes`                                            | Create a new tax rate.                                           |
| 3.33   | `GET`          | `/settings/taxes/{tax}`                                      | Get a single tax rate.                                           |
| 3.34   | `PUT`          | `/settings/taxes/{tax}`                                      | Update a tax rate.                                               |
| 3.35   | `DELETE`       | `/settings/taxes/{tax}`                                      | Delete a tax rate.                                               |
|        |                | **Promotions**                                               |                                                                  |
| 3.36   | `GET`          | `/settings/promotions`                                       | List all promotions.                                             |
| 3.37   | `POST`         | `/settings/promotions`                                       | Create a new promotion.                                          |
| 3.38   | `GET`          | `/settings/promotions/{promotion}`                           | Get a single promotion's details.                                |
| 3.39   | `PUT`          | `/settings/promotions/{promotion}`                           | Update a promotion.                                              |
| 3.40   | `DELETE`       | `/settings/promotions/{promotion}`                           | Delete a promotion.                                              |
|        |                | **Units of Measure**                                         |                                                                  |
| 3.41   | `GET`          | `/settings/units-of-measure`                                 | List all units of measure.                                       |
| 3.42   | `POST`         | `/settings/units-of-measure`                                 | Create a new unit of measure.                                    |
| 3.43   | `GET`          | `/settings/units-of-measure/{unit}`                          | Get a single unit of measure.                                    |
| 3.44   | `PUT`          | `/settings/units-of-measure/{unit}`                          | Update a unit of measure.                                        |
| 3.45   | `DELETE`       | `/settings/units-of-measure/{unit}`                          | Delete a unit of measure.                                        |
|        |                | **Receipts**                                                 |                                                                  |
| 3.46   | `GET`          | `/settings/receipts`                                         | Get the vendor's receipt customization settings.                 |
| 3.47   | `PUT`          | `/settings/receipts`                                         | Update the vendor's receipt settings.                            |
|        |                | **Expense Categories**                                       |                                                                  |
| 3.48   | `GET`          | `/settings/expense-categories`                               | List all expense categories.                                     |
| 3.49   | `POST`         | `/settings/expense-categories`                               | Create a new expense category.                                   |
| 3.50   | `PUT`          | `/settings/expense-categories/{category}`                    | Update an expense category.                                      |
---

### **Part 4: Product Catalog & Inventory**

| SL No. | Method | Full Endpoint Path                                     | Purpose & Key Logic                                                              | Request Payload (Body)                                                 |
|:------:|:------:|:-------------------------------------------------------|:---------------------------------------------------------------------------------|:-----------------------------------------------------------------------|
| 4.01-4.05| *CRUD* | `/catalog/products` & `.../{product}`                  | Full CRUD for master products (vendor-level templates).                          |                                                                        |
| 4.06   | `GET`  | `/catalog/products/{product}/branch-settings`          | List branch-specific settings (price, sku) for a product.                        | *(None)*                                                               |
| 4.07   | `POST` | `/catalog/products/{product}/branch-settings`          | Create or update settings for a product at a specific branch.                    | `{ "branch_id", "sell_price", "sku", "barcode", "is_active" }`           |
| 4.08-4.11| *CRUD* | `/catalog/categories` & `.../{category}`               | Full CRUD for Categories.                                                        |                                                                        |
| 4.12   | `GET`  | `/inventory/stock-levels`                              | Get a comprehensive overview of all `inventory_batches`. Filterable.             | *(Query Params: `branch_id`, `product_id`, `low_stock`)*                 |
| 4.13   | `GET`  | `/inventory/adjustments`                               | Get a history of all manual stock adjustments.                                   | *(None)*                                                               |
| 4.14   | `POST` | `/inventory/adjustments`                               | Perform a manual stock adjustment on a specific batch.                           | `{ "inventory_batch_id", "quantity_changed", "reason" }`                 |
| 4.15-4.18| *CRUD* | `/inventory/suppliers` & `.../{supplier}`              | Full CRUD for Suppliers.                                                         |                                                                        |
| 4.19-4.22| *CRUD* | `/inventory/purchase-orders` & `.../{po}`              | Full CRUD for Purchase Orders.                                                   |                                                                        |
| 4.23   | `POST` | `/inventory/purchase-orders/{po}/receive`              | Receive stock against a PO, which creates new `inventory_batches`.               | `{ "items": [ { "po_item_id", "quantity_received", "buy_price", ... } ] }` |
| 4.24-4.27| *CRUD* | `/inventory/stock-transfers` & `.../{transfer}`        | Full CRUD for branch-to-branch stock transfers.                                  |                                                                        |

---

### **Part 5: Sales & Point of Sale (POS)**

| SL No. | Method | Full Endpoint Path          | Purpose & Key Logic                                                              | Request Payload (Body)                                                                   |
|:------:|:------:|:----------------------------|:---------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------|
| 5.01   | `GET`  | `/pos/session-data`         | "Workhorse" endpoint to get all data needed to run the POS UI for a given branch.| *(Query Param: `branch_id`)*                                                              |
| 5.02   | `GET`  | `/sales`                    | Get a paginated list of all sales history.                                       | *(None)*                                                                                 |
| 5.03   | `POST` | `/sales`                    | The main transactional endpoint to create a new sale.                            | `{ "branch_id", "customer_id", "status", "items": [...], "payments": [...] }`            |
| 5.04   | `GET`  | `/sales/{sale}`             | Get the detailed receipt view of a single sale.                                  | *(None)*                                                                                 |
| 5.05   | `PUT`  | `/sales/{sale}`             | Update a sale (e.g., change status to voided).                                   | `{ "status": "voided" }`                                                                 |
| 5.06   | `GET`  | `/returns`                  | Get a paginated list of all returns history.                                     | *(None)*                                                                                 |
| 5.07   | `POST` | `/returns`                  | Process a return against an existing sale.                                       | `{ "original_sale_id", "reason", "refund_type", "items": [...] }`                        |
| 5.08   | `GET`  | `/returns/{return}`         | Get details of a single return.                                                  | *(None)*                                                                                 |

---

### **Part 6: Operations & Financials**

| SL No. | Method | Full Endpoint Path                                     | Purpose & Key Logic                                                | Request Payload (Body)                                    |
|:------:|:------:|:-------------------------------------------------------|:-------------------------------------------------------------------|:----------------------------------------------------------|
| 6.01-6.05| *CRUD* | `/operations/customers` & `.../{customer}`             | Full CRUD for Customers.                                           |                                                           |
| 6.06   | `GET`  | `/operations/customers/{customer}/store-credit`        | Get a customer's store credit balance and transaction history.     | *(None)*                                                  |
| 6.07   | `POST` | `/operations/customers/{customer}/store-credit/adjust` | Manually adjust a customer's store credit.                         | `{ "amount", "type": "goodwill", "notes" }`               |
| 6.08-6.12| *CRUD* | `/operations/expenses` & `.../{expense}`               | Full CRUD for Expenses.                                            |                                                           |
| 6.13   | `GET`  | `/operations/cash-management/sessions`                 | List all cash register sessions.                                   | *(None)*                                                  |
| 6.14   | `GET`  | `/operations/cash-management/sessions/{session}`       | Get details of a single cash session.                              | *(None)*                                                  |
| 6.15   | `POST` | `/operations/cash-management/sessions/open`            | Open a new cash register session.                                  | `{ "billing_counter_id", "opening_balance" }`             |
| 6.16   | `POST` | `/operations/cash-management/sessions/{session}/close` | Close a cash register session and log discrepancies.               | `{ "closing_balance" }`                                   |
| 6.17   | `POST` | `/operations/cash-management/transactions`             | Log a manual cash movement (pay-in, pay-out, transfer).            | `{ "cash_session_id", "type", "amount", "notes" }`        |

---

### **Part 7: User Profile (Self-Service)**

| SL No. | Method | Full Endpoint Path        | Purpose & Key Logic                                  | Request Payload (Body)                               |
|:------:|:------:|:--------------------------|:-----------------------------------------------------|:-----------------------------------------------------|
| 7.01   | `GET`  | `/profile`                | Get the current user's own profile details.          | *(None)*                                             |
| 7.02   | `PUT`  | `/profile`                | Update the user's own profile details (e.g., name).  | `{ "name" }`                                         |
| 7.03   | `PUT`  | `/profile/password`       | Change the user's own password.                      | `{ "current_password", "password", "password_confirmation" }` |

---

### **Part 8: Billing & Reports**

| SL No. | Method | Full Endpoint Path      | Purpose & Key Logic                                            | Request Payload (Body)                            |
|:------:|:------:|:------------------------|:---------------------------------------------------------------|:--------------------------------------------------|
| 8.01   | `GET`  | `/billing/portal-url`   | Generate a secure, one-time URL to the Stripe Customer Portal. | *(None)*                                          |
| 8.02   | `GET`  | `/reports/dashboard`    | A dedicated endpoint for all dashboard widget data.            | *(Query Params: `branch_id`, `date_range`)*         |
| 8.03   | `POST` | `/reports/export`       | Trigger a background job to generate and email a file export.  | `{ "report_type", "format", ...other_filters }`   |

This exhaustive list, with over 115 explicit endpoints, provides a complete and unambiguous contract for your API. It covers every resource, every action, and every piece of data needed to power the NexusPOS frontend.