# Modern POS System - Full Feature Documentation

This document provides an exhaustive list of features, data structures, and interactive elements for every module in the Modern POS System.

---

## 📄 Module Documentation

### 1. Dashboard
**Description**: The central hub for real-time business intelligence. It provides a high-level overview of daily performance, financial trends, and critical operational alerts. The dashboard is fully responsive and automatically refreshes when the global branch filter is adjusted.

#### 📊 Statistics & Key Performance Indicators (KPIs)
- **Today's Sales**: Total gross revenue from all non-void sales transactions completed today.
- **Today's Expenses**: Total business expenditures logged for the current date.
- **Net Income**: Real-time calculation of (Sales - Expenses) for the day.
- **Total Products**: Global count of unique products registered in the vendor's catalog.
- **Today's Transactions**: Total number of sales processed today.
- **Low Stock Alerts**: A badge count of products across selected branches that have fallen below the minimum stock threshold (default: 10 units).

#### 📈 Data Visualizations
- **Sales vs Expenses Comparison**: A multi-series area chart showing financial performance over the last 30 days.
- **Sales by Payment Method**: A donut chart breaking down today's revenue by payment gateway (Cash, Card, Mobile Pay, etc.).
- **Net Income Trend**: A line chart visualizing profitability over time.

#### 🔔 Operational Feeds
- **Recent Activity Log**: A unified chronological list of the last 8 critical events, including:
    - **Sales Events**: Sale ID, Customer name, Total amount, and relative time.
    - **Expense Events**: Category, amount, description, and relative time.
- **Real-Time Notification Center**: A navbar-integrated bell icon that shows live stock alerts and system notifications.

#### 🔍 Filtering Capabilities
- **Global Branch Scoping**: All dashboard widgets, charts, and activity feeds can be scoped to a single branch, multiple branches, or "All Branches" via the navbar dropdown.
- **Currency Localization**: All monetary values are automatically formatted with the vendor's configured currency symbol (e.g., $, ₹, £).

### 2. POS Terminal (Point of Sale)
**Description**: The mission-critical checkout engine designed for speed, accuracy, and versatility. It supports multiple interface modes to suit different hardware setups (Desktop/Barcode Scanner vs. Touch Tablet).

#### 🖱️ Interface Modes
- **Keyboard-First Mode**: Optimized for high-volume retail using a desktop and physical keyboard.
    - **Command Bar (⌘K)**: Quick access to products, customers, and system actions.
    - **Shortcut Keys**: `F1-F12` mapping for common actions like clearing cart, changing tabs, and processing payment.
- **Touchscreen Mode**: Optimized for tablets and kiosks with large button targets and category-based product navigation.

#### 🛒 Advanced Cart Management
- **Multi-Tab Sales**: Handle up to 10 active sales simultaneously (e.g., for customers still shopping or waiting).
- **Product Search**: 
    - Real-time search by Name, SKU, or Category.
    - **Barcode Support**: Direct item addition upon barcode scan with automatic focus reset for sequential scanning.
- **Line Item Controls**:
    - **Quantity Adjustment**: Click-to-edit or arrow key navigation.
    - **Item-Level Discounts**: Apply fixed amount or percentage discounts to individual items.
    - **Tax Calculation**: Automated VAT/GST application based on vendor settings.
- **Global Adjustments**:
    - **Global Discount**: Apply a discount to the entire subtotal.
    - **Extra Charges**: Manually add service fees or shipping costs.
    - **Promotions**: Real-time auto-calculation of active vendor promotions.

#### 💳 Multi-Payment & Checkout
- **Unified Checkout Modal**: A centralized view for final totals and payment entry.
- **Multiple Payment Methods**: Support for splitting a single bill across multiple methods (e.g., 50% Cash, 50% Card).
- **Payment Types**:
    - **Cash (Counter)**: Integrated change-to-return calculator.
    - **External Card/Mobile Pay**: Reference number logging for reconciliation.
    - **Store Credit**: Deduct amount from customer's existing balance.
- **Customer Association**: Link sales to existing customers or quickly register new ones without leaving the POS screen.

#### 🖨️ Post-Sale Actions
- **Digital & Thermal Receipts**: Fully customizable receipt layouts.
- **Auto-Print**: Configurable automatic printing upon successful transaction.
- **Inventory Sync**: Immediate deduction of stock from the specific billing counter's assigned branch.
- **Register Sessions**: Strict control over Opening and Closing balances for daily reconciliation.

### 3. Products Management
**Description**: The central repository for all goods and services. This module allows vendors to define products with complex configurations, multiple variants, and automated barcode tracking.

#### 📋 Product List (Inventory View)
- **Table Columns**:
    - **ID**: Unique system identifier for the product.
    - **Image**: Thumbnail preview of the product photo.
    - **Name**: The primary display name of the item.
    - **Category**: Clickable link to the assigned product category.
    - **Unit**: The base Unit of Measure (UOM) (e.g., Piece, Kg, Box).
    - **Auditing**: Displays "Created By", "Created At", "Last Updated By", and "Last Updated At" via user hover-cards.
- **Table Interactions**:
    - **Sorting**: Multi-column sorting by Name, ID, Category, and Unit.
    - **Dynamic Column Visibility**: Users can toggle which columns are visible in the table.
    - **Search**: Global real-time search across Name, SKU, and Description.
    - **Bulk Actions**: Select multiple items for "Bulk Delete" operations.
    - **Pagination**: Configurable rows per page (10, 20, 50).

#### 📝 Product Form (Add/Edit)
- **General Information Section**:
    - **Name**: (Required) The official name of the product.
    - **Description**: (Rich Text) Detailed information about the product.
    - **Category Selection**: Dropdown to associate the product with a category for better reporting.
    - **Base Unit of Measure**: Autocomplete search for units (e.g., Ltr, Gram, Unit).
    - **Image Upload**: Drag-and-drop image uploader with real-time preview and server-side optimization.
- **Advanced Variants Section**:
    - **Multi-Variant Support**: Add unlimited variations (e.g., Color: Red, Size: XL).
    - **Variant Specifics**:
        - **Type**: (e.g., "Color")
        - **Value**: (e.g., "Space Gray")
        - **SKU**: Manual input or auto-generated unique identifier.
        - **Barcode**: 
            - Manual input support.
            - **Auto-Generator**: One-click generation of unique EAN-13 compatible barcodes.
            - **Visual Preview**: Real-time rendering of the barcode image for verification.
- **Navigation Flow**:
    - **Redirect Support**: If adding a product from within the POS or Purchase Order screens, the system can automatically return the user to their previous context with the new product selected.

#### 🗂️ Product Categories
- **Description**: Hierarchical organization for products.
- **Attributes**: Category Name, Description, and Parent Category.
- **Usage**: Used for filtering in POS, Inventory Reports, and Sales Analytics.

### 4. Branch Inventory
**Description**: The bridge between the global product catalog and local branch operations. This module tracks physical stock levels, handles replenishment, and manages product availability per location.

#### 📦 Inventory Dashboard
- **Table Columns**:
    - **Image**: Visual identifier of the product.
    - **Product**: Name of the parent product.
    - **Variant**: Specific configuration (e.g., "Medium / Blue").
    - **SKU**: Unique Stock Keeping Unit.
    - **Barcode**: Interactive barcode display for scan verification.
    - **Stock Level**: Current quantity in stock, including the abbreviated unit (e.g., "150 Kg").
    - **Status**: (Branch-specific) A toggle switch to Enable/Disable the product for the currently selected branch.
- **Filtering & View Modes**:
    - **Multi-Branch View**: Aggregate stock levels across multiple selected branches.
    - **Low Stock Filter**: A dedicated toggle to only show products that require urgent replenishment.
    - **Branch Scoping**: Integrated branch selector allows for quick switching between warehouse views.

#### 📥 Stock Management Tools
- **Add Stock Modal**:
    - **Batch Number**: Optional batch/lot tracking.
    - **Quantity**: (Supports decimals for weighted items) Amount to add.
    - **Cost Price**: Log the purchase cost for valuation reports.
    - **Expiry Date**: Track perishable items with automated "Expiring Soon" reporting.
- **Inventory Adjustment (View Stock)**:
    - **Detailed Batch View**: See every active stock batch for a specific variant.
    - **Adjustment Types**: Log stock changes with specific reasons:
        - **Stock In**: Manual replenishment.
        - **Correction**: Fix counting errors.
        - **Damaged**: Mark items as unsellable.
        - **Return**: Re-add stock from customer returns.
- **Product Status Control**: 
    - Enable or disable items for specific branches. Disabled items will not appear in that branch's POS terminal.

#### ⚙️ Automated Stock Logic
- **Real-Time Deduction**: Sales processed in the POS immediately decrement stock from the cashier's assigned branch.
- **Stock Batching**: FIFO (First-In, First-Out) logic is used for stock deduction to ensure accurate cost-of-goods-sold (COGS) reporting and expiry management.

### 5. Sales History
**Description**: The definitive ledger of all customer transactions. This module provides deep visibility into historical sales, financial audit trails, and the ability to process post-sale adjustments like voiding or re-printing receipts.

#### 📊 Transaction Ledger (Table View)
- **Table Columns**:
    - **Sale ID**: Unique transaction reference number.
    - **Customer**: Name of the associated customer (defaults to "Walk-in" for guest checkouts).
    - **Branch**: The location where the sale was processed.
    - **Salesperson**: The cashier or staff member who completed the sale.
    - **Items**: A count of unique line items in the transaction.
    - **Financials**: 
        - **Subtotal**: Amount before tax and global discounts.
        - **Discount**: Total discount applied (highlighted in red for easy identification).
        - **Tax**: Total VAT/GST collected.
        - **Total**: The final amount paid by the customer (bolded).
    - **Payment**: Visual chips indicating the payment methods used (e.g., Cash, Card, Mobile Pay).
    - **Status**: Current state of the sale:
        - **Completed**: Finalized and stock deducted.
        - **Voided**: Transaction cancelled, stock and revenue reversed.
        - **Refunded**: Items returned and money paid back.
    - **Date**: Full timestamp of the transaction.
- **Advanced Filtering Suite**:
    - **Multi-Branch Filter**: View sales from specific locations.
    - **Status Filter**: Quickly isolate voided or refunded transactions.
    - **Payment Method Filter**: Filter by specific gateway (e.g., "Show only Card sales").
    - **Date Range Selection**: Precise "From" and "To" date filters for financial reconciliation.
    - **Search**: Search by Sale ID or Customer Name.

#### 🔍 Sale Details & Actions
- **Detailed Modal View**:
    - **Line Item Breakdown**: List of all products, quantities, prices, and taxes per item.
    - **Payment Breakdown**: List of all payments received, including tendered amounts and change given.
    - **Auditing Information**: View which billing counter and register session processed the sale.
- **Critical Actions**:
    - **Void Sale**: Cancel the transaction. This action **automatically restores stock** to the branch inventory and adjusts register balances. Requires confirmation due to financial impact.
    - **Reprint Receipt**: Regenerate and print the thermal/digital receipt for the customer.
    - **Delete Record**: Permanently remove the sale from the history (Restricted by permission).

#### 💸 Financial Reconciliation
- **Real-Time Totals**: All filtered views show aggregated totals for quick daily revenue checks.
- **Export Capabilities**: Supports data export for external accounting audits.

### 6. Procurement (Purchase Orders)
**Description**: The supply chain management module. This module facilitates the ordering of stock from external suppliers and tracks the lifecycle of procurement from initial request to delivery at a specific branch.

#### 🛒 Order Management (List View)
- **Table Columns**:
    - **Order ID**: System-generated procurement reference.
    - **Supplier**: The registered vendor/provider of the goods.
    - **Total**: The aggregate cost of all items in the order.
    - **Status**: Visual indicator of the order's progress:
        - **Pending**: Order created but not yet confirmed or shipped.
        - **Received**: Goods have arrived and stock has been automatically updated in the destination branch.
        - **Cancelled**: Order aborted.
    - **Created At**: Date the order was initiated.
- **Supply Chain Filters**:
    - **Branch Scoping**: Filter orders by the destination branch.
    - **Search**: Search by Order ID or Supplier Name.
    - **Sorting**: Prioritize by Date, Total Amount, or Status.

#### 📝 Purchase Order Form (New/Edit)
- **General Information Section**:
    - **Supplier Selection**: Select from the vendor's pre-registered suppliers.
    - **Destination Branch**: Specify which branch the stock should be added to upon receipt.
    - **Order Date**: The official date the order was placed.
    - **Expected Delivery**: (Optional) Date tracking for supply chain efficiency.
    - **Notes**: (Rich Text) Special instructions for the supplier or internal team.
- **Order Items Matrix**:
    - **Variant Selection**: Autocomplete search across all product variants in the catalog.
    - **Quantity**: Amount ordered (supports decimal for bulk goods).
    - **Unit Price**: Negotiated cost per unit from the supplier.
    - **Real-Time Calculation**: The grand total is automatically updated as line items are modified.
- **Workflow Actions**:
    - **Receive Order**: (Post-Save) A dedicated action to confirm delivery. This **automatically creates stock batches** in the Branch Inventory module using the cost prices defined in the PO.

#### 🏢 Supplier Directory
- **Description**: Central management of product providers.
- **Attributes**: Supplier Name, Contact Person, Email, Phone, Address, and Tax ID.
- **Analytics**: View historical purchase trends and total spend per supplier.

### 7. Returns
**Description**: The post-sale service module. It enables staff to process customer returns efficiently while ensuring financial accuracy and automated inventory reconciliation.

#### 🔄 Return Log (Table View)
- **Table Columns**:
    - **Return ID**: Unique reference for the return transaction.
    - **Sale ID**: Link to the original purchase transaction.
    - **Reason**: Brief explanation for the return (e.g., "Damaged", "Wrong Size").
    - **Total Refunded**: The actual amount paid back to the customer.
    - **Created At**: Date and time the return was processed.
- **Audit Tools**:
    - **Branch Scoping**: View returns processed at specific locations.
    - **Search**: Locate returns by Return ID or Original Sale ID.

#### 🛠️ Process Return Form
- **Original Sale Lookup**:
    - Search for the transaction using the Sale ID or scan the receipt barcode.
    - **Data Verification**: Once a sale is selected, the system displays the original customer, branch, and items.
- **Item Selection Matrix**:
    - **Granular Return**: Select specifically which items from the sale are being returned and in what quantity.
    - **Condition Tracking**: Indicate if the item is "Restockable" or "Damaged".
- **Refund Calculation**:
    - **Pro-rata Refund**: The system automatically calculates the refundable amount based on original prices and applied taxes/discounts.
    - **Manual Adjustment**: Cashiers can override the refund amount if needed (within authorized limits).
- **Reasoning**: A mandatory field to select or type the reason for the return for reporting purposes.

#### 📈 Automated Logic
- **Restocking**: If an item is marked as "Restockable", the system **automatically adds the quantity back** to the branch inventory batch.
- **Financial Reversal**: The refund amount is deducted from the current register session's cash/method balance, ensuring daily reports stay balanced.
- **Status Sync**: The original sale status is updated to "Partially Returned" or "Refunded" based on the items processed.

### 8. Customers
**Description**: The Customer Relationship Management (CRM) module. It allows vendors to maintain a robust database of their clientele, track individual purchase behaviors, and manage loyalty-related data.

#### 👥 Client Directory (Table View)
- **Table Columns**:
    - **Name**: Primary identifier (Full Name or Business Name).
    - **Email**: Electronic contact address for digital receipts and marketing.
    - **Phone**: Primary contact number.
    - **Created At**: Date the customer was registered.
- **Data Management**:
    - **Sorting**: Order by Name, Date, or Spending volume.
    - **Search**: Locate clients by Phone Number, Email, or Name.
    - **Visibility**: Toggle columns to view additional data like Address or Company.

#### 📝 Customer Profile Form
- **Identity Details**:
    - **First/Last Name**: Individual registration.
    - **Company Name**: (Optional) For B2B clients.
    - **Email & Phone**: Communication channels.
- **Locational Data**:
    - **Address**: Detailed shipping/billing location.
- **Financial Status**:
    - **Total Spend**: Automated tracking of total revenue generated by this customer.
    - **Visit Count**: Total number of unique transactions.

#### 🌟 CRM Features
- **Instant POS Registration**: Add new customers directly from the checkout screen to ensure no sale goes un-tracked.
- **Purchase History**: Deep-link to view every transaction associated with a specific customer.
- **Exporting**: Download the customer database for external CRM or email marketing tools.
- **Bulk Import**: (Coming Soon) Support for migrating existing customer lists from CSV or Excel.

### 9. Expenses
**Description**: The expenditure tracking module. It provides a structured way to log and categorize business costs, ensuring accurate net income calculations and branch-level financial accountability.

#### 💸 Expense Ledger (Table View)
- **Table Columns**:
    - **Category**: The type of expense (e.g., "Rent", "Utilities", "Marketing").
    - **Amount**: The monetary value of the expense.
    - **Description**: Detailed note regarding the expenditure.
    - **Date**: The official date the expense was incurred.
    - **Created At**: System timestamp for audit purposes.
- **Reporting Filters**:
    - **Branch Allocation**: View expenses attributed to specific branches.
    - **Category Filter**: Isolate specific cost types.
    - **Date Range**: Filter by month, quarter, or custom period.
    - **Search**: Search across descriptions and categories.

#### 📝 Expense Form
- **Core Attributes**:
    - **Amount**: (Required) Numeric value.
    - **Expense Category**: Select from pre-defined vendor categories.
    - **Branch**: Specify which branch is responsible for this cost.
    - **Date**: Select the incurring date via calendar picker.
    - **Description**: Multi-line text field for itemized details.
- **Document Management**:
    - **Receipt Upload**: Attach digital copies of receipts or invoices for tax compliance and audit trails.

#### 📊 Financial Impact
- **Real-Time Integration**: Logged expenses are immediately reflected in the Dashboard's "Net Income" calculation.
- **Expense Categories**: Fully customizable categories managed in the settings module.

### 10. User & Role Management
**Description**: The security and staff orchestration module. It allows vendor owners to manage their team, assign users to specific branches, and define granular access levels via a robust role-based permission system.

#### 👥 Staff Directory (Table View)
- **Table Columns**:
    - **Name**: Staff member's full name with a visual avatar (initials-based).
    - **Email**: Corporate or personal email for login.
    - **Phone**: Contact number for staff coordination.
    - **Role**: The assigned security role (e.g., "Manager", "Cashier").
    - **Joined At**: Date the user was added to the vendor team.
    - **Auditing**: Full tracking of who created or last updated the user profile.
- **Administrative Filters**:
    - **Branch Filter**: View staff assigned to specific locations.
    - **Role Filter**: Isolate users by their access level.
    - **Search**: Global search across Name, Email, and Phone.

#### 📝 User Profile Form
- **Authentication & Identity**:
    - **First/Last Name**: (Required)
    - **Email**: Unique login identifier.
    - **Password**: Secure password assignment for new users.
- **Organizational Structure**:
    - **Role Assignment**: Select from the vendor's custom-defined roles.
    - **Multi-Branch Assignment**: Assign users to one or more branches. This limits the branches they can see in the global branch selector.

#### 🛡️ Role & Permission System
- **Custom Role Creation**: Define roles tailored to business needs (e.g., "Inventory Specialist").
- **Granular Permissions**: Toggle over 50+ specific capabilities, including:
    - **POS Access**: Can use the terminal, process returns, or void sales.
    - **Inventory Management**: Can view levels, add stock, or adjust batches.
    - **Financial Reporting**: Can view dashboard KPIs, expense logs, or sales reports.
    - **Staff Control**: Can add users, edit roles, or manage branch settings.
- **Hierarchical Security**: Ensures that staff only see and interact with modules necessary for their specific job functions.

#### 🏢 Branch Management
- **Centralized Control**: Define all physical or digital locations for the vendor.
- **Attributes**: Branch Name, Address, Contact Email/Phone.
- **Integrated Logic**: Branches serve as the primary scoping mechanism for Inventory, Sales, Expenses, and Staff.

### 11. Reports & Analytics
**Description**: The business intelligence module. It aggregates raw transaction data into actionable visual insights, allowing owners to identify trends, top-performing products, and financial health.

#### 📈 Sales Reports
- **Daily Sales Revenue (Line Chart)**: Interactive visualization of gross revenue over a 30-day period.
- **Top Products by Revenue (Bar Chart)**: Identifies the highest-earning product variants.
- **Sales by Category (Donut Chart)**: Percentage breakdown of revenue across different product groups.
- **Filtered Insights**: All charts dynamically update based on the global Branch Selector and custom Date Range filters.

#### 📦 Inventory Reports
- **Stock Value Assessment**: Real-time calculation of total inventory value based on cost prices.
- **Low Stock Dashboard**: Comprehensive list of all items nearing depletion across all selected branches.
- **Expiry Tracking**: List of products nearing their expiration date (if applicable).

#### 📄 Data Export
- **CSV/Excel Export**: Download filtered report data for external analysis or tax filing.
- **Printable Reports**: Formatted PDF views for physical record-keeping.

### 12. Settings & Customization
**Description**: The configuration engine. It allows vendors to tailor the system's behavior, branding, and financial rules to their specific business model.

#### 💼 Business Settings
- **Currency Configuration**: Set the currency symbol ($, ₹, ৳) and decimal precision.
- **Tax Rules**: Define the global VAT/GST rate (applied automatically at POS).
- **Interface Preferences**: Toggle between "Keyboard-First" or "Touchscreen" POS modes.

#### 🖨️ Receipt Customization
- **Header/Footer Branding**: Upload a business logo and add custom contact info or "Thank You" messages.
- **Template Styles**: Adjust font sizes and layout density for thermal printers.
- **Auto-Print Rules**: Enable or disable automatic receipt generation post-sale.

#### 💳 Payment Gateways
- **Method Management**: Enable or disable specific payment types (Cash, Card, Mobile Banking).
- **Reference Tracking**: Configure mandatory reference number logging for digital payments to aid in reconciliation.

### 13. Promotions & Discounts
**Description**: The marketing and dynamic pricing module. It allows vendors to create time-bound discount campaigns that apply automatically during the POS checkout process based on predefined rules.

#### 📢 Campaign Management (List View)
- **Table Columns**:
    - **Name**: The display name of the promotion (e.g., "Eid Special", "Black Friday").
    - **Discount Type**: Percentage (%) or Fixed Amount ($).
    - **Value**: The magnitude of the discount.
    - **Status**: Visual toggle for "Active" or "Inactive".
    - **Duration**: Displays both "Start Date" and "End Date" for the campaign.
- **Rules & Constraints**:
    - **Automatic Trigger**: Promotions are applied in real-time in the POS when the current date falls within the campaign window.
    - **Search**: Locate campaigns by name.

#### 📝 Promotion Form
- **Configuration**:
    - **Campaign Name**: (Required)
    - **Description**: Internal notes regarding the offer.
    - **Discount Logic**: Choose between "Percentage" or "Fixed Amount".
    - **Discount Value**: The numeric value to subtract.
    - **Scheduling**: Calendar pickers for precise start and end timestamps.

### 14. Cash Management (Register Sessions)
**Description**: The financial accountability module. It tracks the physical movement of cash in and out of the billing counters through structured register sessions.

#### 🏦 Session Ledger
- **Table Columns**:
    - **Session ID**: Unique audit reference.
    - **Counter & Branch**: The specific register and location.
    - **Opened By**: The user who initiated the session.
    - **Timestamps**: "Opened At" and "Closed At" (if finalized).
    - **Balances**: 
        - **Opening Balance**: The initial cash-in-drawer.
        - **Closing Balance**: The final cash counted at the end of the shift.
        - **Calculated Cash**: Expected cash based on recorded sales and expenses.
    - **Discrepancy**: **Automated calculation** of (Closing - Calculated). Discrepancies are color-coded (Red for shortage, Yellow for overage, Green for balanced).
- **Session Controls**:
    - **Open Register**: Initiate a new session with an opening float.
    - **Close Register**: End-of-shift reconciliation with mandatory closing balance entry.

### 15. Activity Log (Audit Trail)
**Description**: The system's "Black Box" recorder. It logs every critical administrative and transactional action taken within the system, providing a robust trail for forensic auditing and accountability.

#### 📜 Audit Ledger
- **Log Attributes**:
    - **User**: The person who performed the action.
    - **Action Type**: (e.g., "Created Product", "Voided Sale", "Updated Role").
    - **Module**: The specific area of the system affected.
    - **Description**: A human-readable summary of the change.
    - **Timestamps**: High-precision logging of when the event occurred.
- **Forensic Filtering**:
    - **User Filter**: View the activity trail of a specific staff member.
    - **Branch Scoping**: Isolate logs to specific physical locations.
    - **Module Filter**: Focus on critical areas like "Sales" or "Inventory".

### 16. Branch & Counter Management
**Description**: The organizational hierarchy module. It defines the physical structure of the vendor's business, from regional branches to individual point-of-sale hardware stations (Billing Counters).

#### 🏢 Branch Profiles
- **Management**: Add, edit, or remove business locations.
- **Attributes**: Branch Name, Address, Contact details.
- **Role Integration**: Branches serve as the primary access boundary for staff.

#### 🖥️ Billing Counters
- **Configuration**: Define specific checkout stations within each branch.
- **Session Linking**: Each billing counter maintains its own independent cash register sessions and stock deduction logic.
- **Hardware Association**: Used to isolate sales data per physical station for performance tracking.
