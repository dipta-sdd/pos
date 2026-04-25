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
  parent_category_name?: string;
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
  value: string;
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
  sales_person?: { id: number; name: string };
  sale_items?: SaleItem[];
  sale_payments?: SalePaymentDetail[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  variant_id: number;
  product_stock_id?: number;
  quantity: string | number;
  buy_price: string | number;
  sell_price_at_sale: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  tax_rate_applied: string | number;
  line_total: string | number;
  variant?: Variant & { product?: Product };
}

export interface SalePaymentDetail {
  id: number;
  sale_id: number;
  payment_method_id: number;
  cash_register_session_id?: number;
  amount: string | number;
  amount_received?: string | number;
  change?: string | number;
  payment_method?: PaymentMethod;
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
  sales_count?: number;
  sale_payments_sum_amount?: string | number;
  user?: {
    name: string;
  };
  billing_counter?: {
    id: number;
    name: string;
    branch_id: number;
    branch?: Branch;
  };
}

export interface Promotion {
  id: number;
  vendor_id: number;
  branch_id?: number;
  name: string;
  discount_type: string;
  discount_value: string | number;
  applies_to: string;
  product_id?: number;
  variant_id?: number;
  category_id?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockTransfer {
  id: number;
  vendor_id: number;
  from_branch_id: number;
  to_branch_id: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  from_branch?: Branch;
  to_branch?: Branch;
}

export interface Expense {
  id: number;
  vendor_id: number;
  branch_id: number;
  expense_category_id: number;
  amount: string | number;
  description?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  expense_category?: ExpenseCategory;
  branch?: Branch;
}

export interface ExpenseCategory {
  id: number;
  vendor_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BillingCounter {
  id: number;
  branch_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  branch?: Branch;
}

export interface PaymentMethod {
  id: number;
  vendor_id: number;
  branch_id?: number;
  billing_counter_id?: number;
  name: string;
  type: "cash" | "card" | "online" | "other" | "billing_counter";
  description?: string;
  balance?: string | number;
  is_active: boolean;
  total_collected: string | number;
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
  paper_size: "58mm" | "80mm" | "a4";
  font_size: "small" | "medium" | "large";
  show_tax_breakdown: boolean;
  show_payment_details: boolean;
  show_barcode: boolean;
  show_salesperson: boolean;
  show_sale_id: boolean;
  show_date_time: boolean;
  updated_at: string;
}

export interface InventoryAdjustment {
  id: number;
  vendor_id: number;
  branch_id: number;
  variant_id: number;
  quantity: string | number;
  type: "addition" | "subtraction";
  reason: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
  };
  branch?: Branch;
  variant?: Variant;
}
export interface ProductStock {
  id: number;
  branch_id: number;
  product_id: number;
  variant_id: number;
  branch_product_id: number;
  quantity: number;
  cost_price: number;
  selling_price: number;
  expiry_date: string;
  unit_of_measure_name?: string;
  unit_of_measure_abbreviation?: string;
  created_at: string;
  updated_at: string;
}
