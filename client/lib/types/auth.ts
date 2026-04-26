// Auth utility types for managing authentication state

import { Branch } from "./general";

export interface Role {
  id: number;
  vendor_id: number;
  name: string;
  // Access Control
  can_view_access_control: boolean;
  can_manage_access_control: boolean;
  can_delete_access_control: boolean;
  // Product & Catalog
  can_view_catalog: boolean;
  can_manage_catalog: boolean;
  can_delete_catalog: boolean;
  // Organization Settings
  can_view_organization_settings: boolean;
  can_edit_organization_settings: boolean;
  can_delete_organization_settings: boolean;
  // Inventory & Stock Management
  can_view_stock_and_inventory: boolean;
  can_manage_stock_and_inventory: boolean;
  // Operations & Procurement
  can_view_operations: boolean;
  can_manage_operations: boolean;
  can_delete_operations: boolean;
  // Sales & POS
  can_use_pos: boolean;
  can_manage_checkout_pricing: boolean;
  can_manage_sales: boolean;
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
  // Financial & Cash Management
  can_manage_cash_drawer: boolean;
  // Reports & Analytics
  can_view_reports: boolean;
  can_view_financial_analytics: boolean;
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
