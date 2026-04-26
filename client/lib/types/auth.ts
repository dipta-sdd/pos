// Auth utility types for managing authentication state

import { Branch } from "./general";

export interface Role {
  id: number;
  vendor_id: number;
  name: string;
  // User Management
  can_view_users: boolean;
  can_edit_users: boolean;
  can_delete_users: boolean;
  can_view_roles: boolean;
  can_edit_roles: boolean;
  can_delete_roles: boolean;
  can_view_user_activity_log: boolean;
  // Product & Catalog
  can_view_products: boolean;
  can_edit_products: boolean;
  can_delete_products: boolean;
  can_import_products: boolean;
  can_export_products: boolean;
  // Categories
  can_view_categories: boolean;
  can_edit_categories: boolean;
  can_delete_categories: boolean;
  // Units of Measure
  can_view_units_of_measure: boolean;
  can_edit_units_of_measure: boolean;
  can_delete_units_of_measure: boolean;
  // Branches
  can_view_branches: boolean;
  can_edit_branches: boolean;
  can_delete_branches: boolean;
  // Counters
  can_view_counters: boolean;
  can_edit_counters: boolean;
  can_delete_counters: boolean;
  // Payment Methods
  can_view_payment_methods: boolean;
  can_edit_payment_methods: boolean;
  can_delete_payment_methods: boolean;
  // Inventory & Stock Management
  can_view_stock_and_inventory: boolean;
  can_manage_stock_and_inventory: boolean;
  // Purchase Orders
  can_view_purchase_orders: boolean;
  can_edit_purchase_orders: boolean;
  can_delete_purchase_orders: boolean;
  // Suppliers
  can_view_suppliers: boolean;
  can_edit_suppliers: boolean;
  can_delete_suppliers: boolean;
  // Expenses
  can_view_expenses: boolean;
  can_edit_expenses: boolean;
  can_delete_expenses: boolean;
  // Cash Transactions
  can_request_cash_transactions: boolean;
  can_approve_cash_transactions: boolean;
  // Shop & Organization
  can_manage_shop_settings: boolean;
  can_manage_billing_and_plan: boolean;
  can_configure_taxes: boolean;
  can_customize_receipts: boolean;
  // Sales & POS
  can_use_pos: boolean;
  can_view_sales_history: boolean;
  can_override_prices: boolean;
  can_apply_manual_discounts: boolean;
  can_void_sales: boolean;
  // Returns
  can_process_returns: boolean;
  can_issue_cash_refunds: boolean;
  can_issue_store_credit: boolean;
  // Customers
  can_view_customers: boolean;
  can_manage_customers: boolean;
  // Promotions
  can_view_promotions: boolean;
  can_manage_promotions: boolean;
  // Financial
  can_open_close_cash_register: boolean;
  // Reports & Analytics
  can_view_dashboard: boolean;
  can_view_reports: boolean;
  can_view_profit_loss_data: boolean;
  can_export_data: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_name?: string;
  updated_by: number;
  updated_by_name?: string;
}

export interface Vendor {
  id: number;
  owner_id: number;
  name: string;
  description: string;
  phone: string;
  address: string;
  subscription_tier: string;
  currency: string;
  timezone: string;
  language: string;
  settings?: any;
  created_at: string;
  updated_at: string;
  branches: any[]; // You can define a Branch interface if needed
}

interface UserBranchAssignment {
  id: number;
  membership_id: number;
  branch_id: number;
  branch: Branch;
  created_by: number;
  updated_by: number;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}
export interface Membership {
  id: number;
  user_id: number;
  vendor_id: number;
  role_id: number;
  created_at: string;
  updated_at: string;
  vendor: Vendor;
  role: Role;
  user_branch_assignments: UserBranchAssignment[];
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  email_verified_at?: string | null;
  mobile_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  memberships: Membership[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
