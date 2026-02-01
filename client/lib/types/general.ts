export interface Branch {
  id: number;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  created_at: string;
  created_by_name?: string;
  updated_at: string;
  updated_by_name?: string;
}

export interface Category {
  id: number;
  vendor_id: number;
  name: string;
  description?: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  parent?: Category;
  children?: Category[];
}

export interface UnitOfMeasure {
  id: number;
  vendor_id: number;
  name: string;
  abbreviation: string;
  is_decimal_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  description?: string;
  category_id?: number;
  image_url?: string;
  unit_of_measure_id?: number;
  sku?: string; // Often flattened in API
  base_price?: string | number; // Often flattened in API
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  category?: Category;
  unit_of_measure?: UnitOfMeasure;
  variants?: Variant[];
}

export interface Variant {
  id: number;
  product_id: number;
  name: string;
  value?: string;
  sku: string;
  barcode?: string;
  unit_of_measure_id?: number;
  stock_quantity?: number; // Often added in transformers
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Customer {
  id: number;
  vendor_id: number;
  name: string;
  first_name?: string; // Sometimes split in frontend
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  vendor_id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  vendor_id: number;
  branch_id: number;
  sales_person_id: number;
  cash_register_session_id?: number;
  customer_id?: number;
  subtotal_amount: string | number;
  total_discount_amount: string | number;
  tax_amount: string | number;
  final_amount: string | number;
  status: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  branch?: Branch;
}

export interface SaleReturn {
  id: number;
  vendor_id: number;
  branch_id: number;
  original_sale_id: number;
  reason: string;
  refund_type: string;
  refund_amount: string | number;
  exchange_sale_id?: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: number;
  vendor_id: number;
  supplier_id: number;
  branch_id: number;
  status: string;
  total_amount: string | number;
  paid_amount: string | number;
  order_date: string;
  expected_delivery_date?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface CashRegisterSession {
  id: number;
  billing_counter_id: number;
  user_id: number;
  opening_balance: string | number;
  closing_balance?: string | number;
  calculated_cash?: string | number;
  discrepancy?: string | number;
  started_at: string;
  ended_at?: string;
  status: string;
  user?: {
    name: string;
  };
}

export interface PaymentMethod {
  id: number;
  vendor_id: number;
  branch_id?: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tax {
  id: number;
  vendor_id: number;
  name: string;
  rate_percentage: string | number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReceiptSettings {
  vendor_id: number;
  header_text?: string;
  footer_text?: string;
  show_logo: boolean;
  show_address: boolean;
  show_contact_info: boolean;
  template_style?: string;
  updated_at: string;
}

export interface InventoryAdjustment {
  id: number;
  vendor_id: number;
  branch_id: number;
  reason: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
  };
}
