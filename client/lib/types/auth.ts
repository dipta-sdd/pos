// Auth utility types for managing authentication state

export interface Role {
  id: number;
  vendor_id: number;
  name: string;
  can_manage_shop_settings: boolean;
  can_manage_billing_and_plan: boolean;
  can_manage_branches_and_counters: boolean;
  can_manage_payment_methods: boolean;
  can_configure_taxes: boolean;
  can_customize_receipts: boolean;
  can_manage_staff: boolean;
  can_manage_roles_and_permissions: boolean;
  can_view_roles: boolean;
  can_view_user_activity_log: boolean;
  can_view_products: boolean;
  can_manage_products: boolean;
  can_manage_categories: boolean;
  can_manage_units_of_measure: boolean;
  can_import_products: boolean;
  can_export_products: boolean;
  can_view_inventory_levels: boolean;
  can_perform_stock_adjustments: boolean;
  can_manage_stock_transfers: boolean;
  can_manage_purchase_orders: boolean;
  can_receive_purchase_orders: boolean;
  can_manage_suppliers: boolean;
  can_use_pos: boolean;
  can_view_sales_history: boolean;
  can_override_prices: boolean;
  can_apply_manual_discounts: boolean;
  can_void_sales: boolean;
  can_process_returns: boolean;
  can_issue_cash_refunds: boolean;
  can_issue_store_credit: boolean;
  can_view_customers: boolean;
  can_manage_customers: boolean;
  can_view_promotions: boolean;
  can_manage_promotions: boolean;
  can_open_close_cash_register: boolean;
  can_perform_cash_transactions: boolean;
  can_manage_expenses: boolean;
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
  created_at: string;
  updated_at: string;
  branches: any[]; // You can define a Branch interface if needed
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
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  email_verified_at?: string | null;
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
